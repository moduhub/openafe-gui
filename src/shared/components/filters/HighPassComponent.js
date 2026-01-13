import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * HighPass component: projeto automático de ordem e vários protótipos.
 * Implementado por spectral inversion: HP = x - LP(x) usando o LP projetado.
 */
export const HighPass = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()
  const [passbandFrequency, setPassbandFrequency] = useState(50) // fp (Hz) - para HP é a borda superior do passe
  const [filterType, setFilterType] = useState('Butterworth')
  const [gain, setGain] = useState(1)
  const [allowablePassbandRipple, setAllowablePassbandRipple] = useState(0.5) // Ap (dB)
  const [stopbandFrequency, setStopbandFrequency] = useState(10) // fs (Hz) - para HP é a borda inferior da rejeição
  const [stopbandAttenuation, setStopbandAttenuation] = useState(20) // As (dB)

  const visible = useMemo(() => {
    const ds = datasets.find(d => d.visible)?.data?.[0]
    if (!ds) return { x: [], y: [] }
    if (dataType === "cvw") return { x: ds.x || [], y: ds.y || [] }
    if (dataType === "bodeMod") return { x: ds.omega || [], y: ds.modZ || [] }
    if (dataType === "bodeAng") return { x: ds.omega || [], y: ds.angZ || [] }
    if (dataType === "nyquist") return { x: ds.realZ || [], y: ds.imagZ || [] }
    return { x: [], y: [] }
  }, [datasets, dataType])

  // ---------- complex helpers ----------
  const complex = (re, im) => ({ re, im })
  const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im })
  const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
  const cdiv = (a, b) => {
    const den = b.re * b.re + b.im * b.im + 1e-24
    return { re: (a.re * b.re + a.im * b.im) / den, im: (a.im * b.re - a.re * b.im) / den }
  }
  const cmag = (c) => Math.sqrt(c.re * c.re + c.im * c.im)
  const cphase = (c) => Math.atan2(c.im, c.re) * 180 / Math.PI

  // ---------- DSP building blocks (copiados / adaptados do LowPass) ----------
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

  // ---------- estimadores de ordem / projeto (mesmos do LowPass) ----------
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

  // ---------- prototypes (copiados / aproximados) ----------
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

  // ---------- useEffect: projeto e preview (HP via spectral inversion) ----------
  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    const ds = datasets.find(d => d.visible)?.data?.[0] || {}
    let fs = 1
    if (dataType === "cvw") {
      const dsVisible = datasets.find(d => d.visible)
      const { scanRate, step } = dsVisible?.params || {}
      if (scanRate && step) fs = scanRate / step
    } else if (dataType === "bodeMod" || dataType === "bodeAng") {
      fs = estimateFs(ds?.omega || visible.x)
    } else if (dataType === "nyquist") {
      if (ds?.omega?.length > 1) fs = estimateFs(ds.omega)
      else fs = 1
    }

    // ---------- map HP specs to equivalent LP problem by frequency inversion ----------
    // For HP user enters fp (higher) and fs (lower). Must have fp > fs.
    let designOrder = 1
    let designFc_lp = passbandFrequency // fallback
    if (!(passbandFrequency > stopbandFrequency && stopbandFrequency > 0)) {
      // invalid spec -> fallback to simple HP single-pole at passband
      designOrder = 1
      designFc_lp = passbandFrequency
    } else {
      // invert frequencies: fp_lp = 1/fp_hp, fs_lp = 1/fs_hp
      const fp_lp = 1 / passbandFrequency
      const fs_lp = 1 / stopbandFrequency
      const design = estimateDesign(filterType, fp_lp, fs_lp, allowablePassbandRipple, stopbandAttenuation)
      designOrder = design.order || 1
      designFc_lp = design.fc || fp_lp
    }

    // epsilon for Chebyshev prototype
    const epsilon = Math.sqrt(Math.max(1e-12, Math.pow(10, allowablePassbandRipple / 10) - 1))

    // Build LP analog sections (prototype) from designFc_lp, then bilinear -> digital LP SOS
    const wc_lp = 2 * Math.PI * designFc_lp
    const analogSectionsLP = getAnalogSectionsFromPrototype(filterType, designOrder, wc_lp, epsilon)
    const sosLP = analogSectionsLP.map(sec => bilinearTransform(sec, fs))

    // ---------- apply LP and do spectral inversion to get HP ----------
    if (dataType === 'cvw') {
      // time-domain: y_lp = LP(x), y_hp = x - y_lp
      const xArr = visible.x
      const yArr = visible.y
      let yLP = applyIIR(yArr, sosLP)
      // apply gain if requested (apply to HP result afterwards)
      const yHP = yArr.map((v, i) => {
        const lpv = yLP[i] || 0
        return (v - lpv) * gain
      })
      setPreviewFilter({ x: [...xArr], y: yHP })
      return
    }

    // EIS: frequency domain
    if (dataType === 'bodeMod') {
      const omega = ds?.omega || visible.x
      const modZ = ds?.modZ || visible.y.map(v => Math.pow(10, v/20))
      const outY = []
      for (let i = 0; i < omega.length; i++) {
        const f = omega[i]
        const Hlp = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designFc_lp, order: designOrder, epsilon })
        const Hhp = csub(complex(1, 0), Hlp) // 1 - H_lp
        const mag = modZ[i] * cmag(Hhp) * gain
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
        const Hlp = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designFc_lp, order: designOrder, epsilon })
        const Hhp = csub(complex(1, 0), Hlp)
          const newAngle = (angZ[i] || 0) + cphase(Hhp)
          outY.push(newAngle)
      }
      setPreviewFilter({ x: omega.length ? omega : visible.x, y: outY })
      return
    }

    if (dataType === 'nyquist') {
      const omega = ds?.omega || []
      const realZ = ds?.realZ || visible.x
      const imagZ = ds?.imagZ || visible.y
      const outReal = []
      const outImag = []
      for (let i = 0; i < realZ.length; i++) {
        const f = omega[i] || 0
        const Z = complex(realZ[i], imagZ[i])
        const Hlp = getComplexH_fromPrototype(filterType, f, { gain: 1, cutoff: designFc_lp, order: designOrder, epsilon })
        const Hhp = csub(complex(1, 0), Hlp)
          const Zf = cmul(Z, Hhp)
          outReal.push(Zf.re * gain)
          outImag.push(Zf.im * gain)
      }
      setPreviewFilter({ x: outReal, y: outImag })
      return
    }

    // fallback
    setPreviewFilter({ x: [...visible.x], y: [...visible.y] })
  }, [
    passbandFrequency, allowablePassbandRipple, stopbandFrequency, stopbandAttenuation,
    visible, setPreviewFilter, datasets, dataType, filterType, gain
  ])

  const isEIS = dataType !== 'cvw'

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'background.paper', color: 'text.primary', height: '100%' }}>
        <Stack spacing={3}>
          {/* Filter Type Selector */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel id="hp-filter-type-label">Type of filter</InputLabel>
              <Select
                labelId="hp-filter-type-label"
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
          </Box>

          {/* Gain */}
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

          {/* Passband Frequency (fp) */}
          <Box>
            <TextField
              label="Passband Frequency (fp) — HP pass band edge"
              type="number"
              value={passbandFrequency}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setPassbandFrequency(isNaN(val) ? 0.1 : Math.max(0.1, val))
              }}
              InputProps={{ endAdornment: <InputAdornment position="end">Hz</InputAdornment> }}
              size="small"
              fullWidth
            />
          </Box>

          {/* Allowable Passband Ripple */}
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

          {/* Stopband Frequency (fs) */}
          <Box>
            <TextField
              label="Stopband Frequency (fs) — HP stop band edge (lower)"
              type="number"
              value={stopbandFrequency}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setStopbandFrequency(isNaN(val) ? 1 : Math.max(1e-6, val))
              }}
              InputProps={{ endAdornment: <InputAdornment position="end">Hz</InputAdornment> }}
              size="small"
              fullWidth
            />
          </Box>

          {/* Stopband Attenuation */}
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
