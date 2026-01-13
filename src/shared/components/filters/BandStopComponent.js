import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * BandStop component — projetado por composição: BS = 1 - BP
 * Parameters:
 *  - lowCut  : lower edge of notch (Hz)
 *  - highCut : upper edge of notch (Hz)
 *  - Ap      : allowable passband ripple (dB) — for prototype design
 *  - As      : stopband attenuation (dB)
 *  - filterType, gain
 */
export const BandStop = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()

  const [lowCut, setLowCut] = useState(10)
  const [highCut, setHighCut] = useState(50)
  const [filterType, setFilterType] = useState('Butterworth')
  const [gain, setGain] = useState(1)
  const [allowablePassbandRipple, setAllowablePassbandRipple] = useState(0.5)
  const [stopbandAttenuation, setStopbandAttenuation] = useState(40)

  const visible = useMemo(() => {
    const ds = datasets.find(d => d.visible)?.data?.[0]
    if (!ds) return { x: [], y: [] }
    switch (dataType) {
      case "cvw":
        return { x: ds.x || [], y: ds.y || [] }
      case "bodeMod":
         return { x: ds.omega || [], y: ds.modZ || [] }
      case "bodeAng":
        return { x: ds.omega || [], y: ds.angZ || [] }
      case "nyquist":
        return { x: ds.omega || [], y: (ds.realZ||[]).map((r,i)=>({ re: r, im: ds.imagZ?.[i]||0 })) }
      default:
        return { x: [], y: [] }
    }
  }, [datasets, dataType])

  // ---------- complex helpers ----------
  const complex = (re, im) => ({ re, im })
  const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im })
  const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im })
  const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
  const cdiv = (a, b) => {
    const den = b.re * b.re + b.im * b.im + 1e-24
    return { re: (a.re * b.re + a.im * b.im) / den, im: (a.im * b.re - a.re * b.im) / den }
  }
  const cmag = (c) => Math.sqrt(c.re * c.re + c.im * c.im)
  const cphase = (c) => Math.atan2(c.im, c.re) * 180 / Math.PI

  // ---------- bilinear / biquad / iir ----------
  const bilinearTransform = (section, fs) => {
    const [b0, b1, b2, a0, a1, a2] = section
    const K = 2 * fs
    const den = a0 * K * K + a1 * K + a2
    const DEN = den === 0 ? 1e-30 : den
    const db0 = (b0 * K * K + b1 * K + b2) / DEN
    const db1 = 2 * (b2 - b0 * K * K) / DEN
    const db2 = (b0 * K * K - b1 * K + b2) / DEN
    const da0 = 1
    const da1 = 2 * (a2 - a0 * K * K) / DEN
    const da2 = (a0 * K * K - a1 * K + a2) / DEN
    return [db0, db1, db2, da0, da1, da2]
  }

  const applyBiquad = (data, coeffs) => {
    const [b0, b1, b2, a0, a1, a2] = coeffs
    const out = new Array(data.length).fill(0)
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0
    for (let i = 0; i < data.length; i++) {
      const x0 = data[i]
      let y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
      y0 = y0 / (a0 || 1)
      out[i] = y0
      x2 = x1; x1 = x0; y2 = y1; y1 = y0
    }
    return out
  }

  const applyIIR = (data, sos) => {
    let out = [...data]
    for (const s of sos) out = applyBiquad(out, s)
    return out
  }

  function estimateFs(x) {
    if (!x || x.length < 2) return 1
    const diffs = []
    for (let i = 1; i < x.length; i++) diffs.push(Math.abs(x[i] - x[i - 1]))
    const meanStep = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return meanStep > 0 ? 1 / meanStep : 1
  }

  // ---------- design helpers (copiados do LowPass/BandPass) ----------
  const estimateOrderButterworth = (fp, fs, Ap, As) => {
    const fp_n = Number(fp) || 0
    const fs_n = Number(fs) || 0
    const Ap_n = Number(Ap) || 0
    const As_n = Number(As) || 0
    if (fp_n <= 0 || fs_n <= fp_n) return { order: 1, fc: fp_n || 1 }
    let eps2 = Math.pow(10, Ap_n / 10) - 1
    if (eps2 <= 0) eps2 = 1e-8
    const AsLin = Math.pow(10, As_n / 10) - 1
    if (AsLin <= 0) return { order: 1, fc: fp_n }
    const OmegaS = fs_n / fp_n
    const numerator = Math.log10(AsLin / eps2)
    const denom = 2 * Math.log10(OmegaS)
    let nFloat = numerator / denom
    if (!isFinite(nFloat) || nFloat <= 0) nFloat = 1
    const n = Math.max(1, Math.ceil(nFloat))
    const eps = Math.sqrt(eps2)
    const fc = fp_n / Math.pow(eps, 1 / n)
    return { order: n, fc: Number.isFinite(fc) && fc > 0 ? fc : fp_n }
  }

  const estimateOrderChebyshevI = (fp, fs, Ap, As) => {
    const fp_n = Number(fp) || 0
    const fs_n = Number(fs) || 0
    const Ap_n = Number(Ap) || 0
    const As_n = Number(As) || 0
    if (fp_n <= 0 || fs_n <= fp_n) return { order: 1, fc: fp_n || 1 }
    const eps2 = Math.pow(10, Ap_n / 10) - 1
    const AsLin = Math.pow(10, As_n / 10) - 1
    if (eps2 <= 0 || AsLin <= 0) return { order: 1, fc: fp_n }
    const OmegaS = fs_n / fp_n
    if (OmegaS <= 1) return { order: 1, fc: fp_n }
    const top = Math.acosh(Math.sqrt(AsLin / eps2))
    const bot = Math.acosh(OmegaS)
    if (!isFinite(top) || !isFinite(bot) || bot === 0) return { order: 1, fc: fp_n }
    const nFloat = top / bot
    const n = Math.max(1, Math.ceil(nFloat))
    return { order: n, fc: fp_n }
  }

  const estimateDesign = (type, fp, fs, Ap, As) => {
    if (type === 'Butterworth') return estimateOrderButterworth(fp, fs, Ap, As)
    if (type === 'Chebyshev I') return estimateOrderChebyshevI(fp, fs, Ap, As)
    if (type === 'Chebyshev II') {
      const r = estimateOrderChebyshevI(fp, fs, Ap, As)
      return { order: Math.max(1, r.order), fc: fp }
    }
    if (type === 'Cauer') {
      const r = estimateOrderChebyshevI(fp, fs, Ap, As)
      return { order: Math.max(1, r.order - 1), fc: fp }
    }
    return estimateOrderButterworth(fp, fs, Ap, As)
  }

  // ---------- prototype poles & analog sections (aprox.) ----------
  const getPrototypePoles = (type, order, epsilon = 1) => {
    const poles = []
    if (type === 'Butterworth') {
      for (let k = 1; k <= order; k++) {
        const angle = (2 * k + order - 1) * Math.PI / (2 * order)
        poles.push({ re: Math.cos(angle), im: Math.sin(angle) })
      }
      return poles
    }
    if (type === 'Chebyshev I') {
      const alpha = Math.asinh(1 / Math.max(1e-12, epsilon)) / order
      for (let k = 1; k <= order; k++) {
        const theta = (2 * k - 1) * Math.PI / (2 * order)
        const re = - Math.sinh(alpha) * Math.sin(theta)
        const im =   Math.cosh(alpha) * Math.cos(theta)
        poles.push({ re, im })
      }
      return poles
    }
    if (type === 'Chebyshev II') {
      const r = getPrototypePoles('Chebyshev I', order, epsilon)
      return r.map(p => ({ re: p.re, im: p.im }))
    }
    if (type === 'Cauer') {
      const r = getPrototypePoles('Chebyshev I', order, epsilon)
      return r.map(p => ({ re: p.re * 1.05, im: p.im * 1.05 }))
    }
    if (type === 'Bessel') {
      const r = getPrototypePoles('Butterworth', order, epsilon)
      return r.map(p => ({ re: p.re * 0.8, im: p.im * 1.2 }))
    }
    if (type === 'Gaussian') {
      const r = getPrototypePoles('Butterworth', order, epsilon)
      return r.map((p, i) => ({ re: p.re * (1 - 0.05 * (i % 3)), im: p.im }))
    }
    return getPrototypePoles('Butterworth', order, epsilon)
  }

  const getAnalogSectionsFromPrototype = (type, order, wc, epsilon = 1) => {
    const pProto = getPrototypePoles(type, order, epsilon)
    const poles = pProto.map(p => ({ re: p.re * wc, im: p.im * wc }))
    const sections = []
    const used = new Array(poles.length).fill(false)
    for (let i = 0; i < poles.length; i++) {
      if (used[i]) continue
      const p = poles[i]
      let pairedIdx = -1
      for (let j = i + 1; j < poles.length; j++) {
        if (used[j]) continue
        const q = poles[j]
        if (Math.abs(p.re - q.re) < 1e-6 && Math.abs(p.im + q.im) < 1e-6) {
          pairedIdx = j
          break
        }
      }
      if (pairedIdx >= 0) {
        const p2 = poles[pairedIdx]
        used[i] = used[pairedIdx] = true
        const a0 = 1
        const a1 = - (p.re + p2.re)
        const a2 = p.re * p.re + p.im * p.im
        const b0 = 0
        const b1 = 0
        const b2 = wc * wc
        sections.push([b0, b1, b2, a0, a1, a2])
      } else {
        used[i] = true
        const a0 = 0
        const a1 = 1
        const a2 = -p.re
        const b0 = 0
        const b1 = 0
        const b2 = wc
        sections.push([b0, b1, b2, a0, a1, a2])
      }
    }
    return sections
  }

  const getComplexH_fromPrototype = (type, fHz, params) => {
    const { gain, cutoff, order, epsilon } = params
    const wc = 2 * Math.PI * cutoff
    const omega = 2 * Math.PI * fHz
    const s = complex(0, omega)
    let H = complex(gain, 0)
    const proto = getPrototypePoles(type, order, epsilon)
    for (const p0 of proto) {
      const p = { re: p0.re * wc, im: p0.im * wc }
      const term = cdiv(complex(wc, 0), csub(s, complex(p.re, p.im)))
      H = cmul(H, term)
    }
    return H
  }

  // ---------- main effect: compute BP for notch edges then invert to BS ----------
  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    const ds = datasets.find(d => d.visible)?.data?.[0] || {}
    let fs = 1
    if (dataType === 'cvw') {
      const dsVisible = datasets.find(d => d.visible)
      const { scanRate, step } = dsVisible?.params || {}
      if (scanRate && step) fs = scanRate / step
    } else {
      fs = estimateFs(ds?.omega || visible.x)
    }

    // sanitize inputs
    const fpLow = Number(lowCut) || 0
    const fpHigh = Number(highCut) || 0
    const Ap = Number(allowablePassbandRipple) || 0
    const As = Number(stopbandAttenuation) || 0
    // basic validation: need low < high
    if (!(fpLow > 0 && fpHigh > fpLow)) {
      setPreviewFilter({ x: [...visible.x], y: [...visible.y] })
      return
    }

    // Choose stopband edges for BP design with reasonable margins around the notch
    // For BP we need passbandLow/passbandHigh (where BP keeps signal) — we want BP = signal inside notch.
    // We'll set BP passband boundaries equal to [fpLow, fpHigh]
    // For stopband edges (fs_low < fpLow and fs_high > fpHigh), pick slight margins:
    const marginLow = Math.max(1e-6, fpLow * 0.8)
    const marginHigh = fpHigh * 1.2
    const fpL = fpLow
    const fpH = fpHigh
    const fsL = marginLow
    const fsH = marginHigh

    // estimate BP design (compose HP_low + LP_high as in BandPass)
    // design lower HP via LP inversion (invert lower edge)
    let designHP = { order: 1, fc: fpL }
    if (fsL > 0 && fpL > fsL) {
      const fp_lp_low = 1 / fpL
      const fs_lp_low = 1 / fsL
      designHP = estimateDesign(filterType, fp_lp_low, fs_lp_low, Ap, As)
    } else {
      designHP = { order: 1, fc: fpL }
    }

    // design upper LP normally for BP
    const designLP = estimateDesign(filterType, fpH, fsH, Ap, As)

    const epsilon = Math.sqrt(Math.max(1e-12, Math.pow(10, Ap / 10) - 1))

    // analog prototypes (LP) for lower-edge (to build HP via inversion) and upper-edge LP
    const wc_lp_low = 2 * Math.PI * (designHP.fc || Math.max(1e-6, fpL))
    const analogSectionsLP_low = getAnalogSectionsFromPrototype(filterType, designHP.order, wc_lp_low, epsilon)
    const sosLP_low = analogSectionsLP_low.map(sec => bilinearTransform(sec, fs))

    const wc_lp_high = 2 * Math.PI * (designLP.fc || Math.max(1e-6, fpH))
    const analogSectionsLP_high = getAnalogSectionsFromPrototype(filterType, designLP.order, wc_lp_high, epsilon)
    const sosLP_high = analogSectionsLP_high.map(sec => bilinearTransform(sec, fs))

    // ---------- time domain: compute BP then invert to get BS ----------
    if (dataType === 'cvw') {
      const xArr = visible.x
      const yArr = visible.y

      // LP_low -> spectral inversion -> HP_low: yHP_low = y - yLP_low
      let yLP_low = applyIIR(yArr, sosLP_low)
      let yHP_low = yArr.map((v, i) => v - (yLP_low[i] || 0))

      // apply LP_high on yHP_low to get BP (band that was inside notch)
      let yBP = applyIIR(yHP_low, sosLP_high)

      // BANDSTOP = original - BP
      let yBS = yArr.map((v, i) => (v - (yBP[i] || 0)) * gain)

      setPreviewFilter({ x: [...xArr], y: yBS })
      return
    }

    // ---------- frequency domain: H_bp = Hhp_low * Hlp_high ; then H_bs = 1 - H_bp ----------
    if (dataType === 'bodeMod') {
      const omega = ds?.omega || visible.x
      const modZ = ds?.modZ || visible.y.map(v => Math.pow(10, v/20))
      const outY = []
      for (let i = 0; i < omega.length; i++) {
        const f = omega[i]
        const Hlp_low = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designHP.fc, order: designHP.order, epsilon })
        const Hhp_low = csub(complex(1, 0), Hlp_low)
        const Hlp_high = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designLP.fc, order: designLP.order, epsilon })
        const Hbp = cmul(Hhp_low, Hlp_high)
        const Hbs = csub(complex(1, 0), Hbp)
        const mag = modZ[i] * cmag(Hbs) * gain
        outY.push(mag)
      }
      setPreviewFilter({ x: omega.length ? omega : visible.x, y: outY })
      return
    }

    if (dataType === 'bodeAng') {
      const omega = ds?.omega || visible.x
      const angZ = ds?.angZ || visible.y
      const outY = []
      for (let i = 0; i < omega.length; i++) {
        const f = omega[i]
        const Hlp_low = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designHP.fc, order: designHP.order, epsilon })
        const Hhp_low = csub(complex(1, 0), Hlp_low)
        const Hlp_high = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designLP.fc, order: designLP.order, epsilon })
        const Hbp = cmul(Hhp_low, Hlp_high)
        const Hbs = csub(complex(1, 0), Hbp)
        const newAngle = (angZ[i] || 0) + cphase(Hbs)
        outY.push(newAngle)
      }
      setPreviewFilter({ x: omega.length ? omega : visible.x, y: outY })
      return
    }

    if (dataType === 'nyquist') {
      const omega = ds?.omega || visible.x
      const realZ = ds?.realZ || visible.x
      const imagZ = ds?.imagZ || visible.y?.map(p=>p.im) || visible.y
      const outReal = []
      const outImag = []
      for (let i = 0; i < realZ.length; i++) {
        const f = omega[i] || 0
        const Z = complex(realZ[i] || 0, imagZ?.[i] || 0)
        const Hlp_low = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designHP.fc, order: designHP.order, epsilon })
        const Hhp_low = csub(complex(1, 0), Hlp_low)
        const Hlp_high = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designLP.fc, order: designLP.order, epsilon })
        const Hbp = cmul(Hhp_low, Hlp_high)
        const Hbs = csub(complex(1, 0), Hbp)
        const Zf = cmul(Z, Hbs)
        outReal.push(Zf.re * gain)
        outImag.push(Zf.im * gain)
      }
      setPreviewFilter({ x: outReal, y: outImag })
      return
    }

    // fallback
    setPreviewFilter({ x: [...visible.x], y: [...visible.y] })
  }, [
    lowCut, highCut, allowablePassbandRipple, stopbandAttenuation,
    filterType, gain, visible, setPreviewFilter, datasets, dataType
  ])

  const isEIS = dataType !== 'cvw'

  return (
    <Box>
      <Box sx={{ mt:1, p:2, borderRadius:1, backgroundColor: 'background.paper', color: 'text.primary', height: '100%' }}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="bs-filter-type-label">Type of filter</InputLabel>
            <Select
              labelId="bs-filter-type-label"
              value={filterType}
              label="Type of filter"
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ color: 'text.primary', '& .MuiSelect-icon': { color: 'text.primary' } }}
              MenuProps={{ PaperProps: { sx: { bgcolor: 'background.paper' } } }}
            >
              <MenuItem value="Butterworth">Butterworth</MenuItem>
              <MenuItem value="Chebyshev I">Chebyshev (Type I)</MenuItem>
              <MenuItem value="Chebyshev II">Chebyshev (Type II)</MenuItem>
              <MenuItem value="Bessel">Bessel</MenuItem>
              <MenuItem value="Gaussian">Gaussian</MenuItem>
              <MenuItem value="Cauer">Cauer</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <TextField
              label="Gain"
              type="number"
              value={gain}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setGain(isNaN(val) ? 1 : Math.max(0, val))
              }}
              size="small"
              fullWidth
            />
          </Box>

          <Box>
            <TextField
              label="Low Cutoff"
              type="number"
              value={lowCut}
              onChange={e=>setLowCut(Number(e.target.value))}
              InputProps={{ endAdornment:<InputAdornment>Hz</InputAdornment> }}
              size="small" fullWidth
            />
          </Box>

          <Box>
            <TextField
              label="High Cutoff"
              type="number"
              value={highCut}
              onChange={e=>setHighCut(Number(e.target.value))}
              InputProps={{ endAdornment:<InputAdornment>Hz</InputAdornment> }}
              size="small" fullWidth
            />
          </Box>

          <Box>
            <TextField
              label="Allowable Passband Ripple (Ap)"
              type="number"
              value={allowablePassbandRipple}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setAllowablePassbandRipple(isNaN(val) ? 0.5 : Math.max(0, val))
              }}
              InputProps={{ endAdornment: <InputAdornment position="end">dB</InputAdornment> }}
              size="small"
              fullWidth
            />
          </Box>

          <Box>
            <TextField
              label="Stopband Attenuation (As)"
              type="number"
              value={stopbandAttenuation}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setStopbandAttenuation(isNaN(val) ? 40 : Math.max(0, val))
              }}
              InputProps={{ endAdornment: <InputAdornment position="end">dB</InputAdornment> }}
              size="small"
              fullWidth
            />
          </Box>

        </Stack>
      </Box>
    </Box>
  )
}
