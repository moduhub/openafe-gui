import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Stack,
  TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * @brief A component that applies a low-pass RC filter of order n
 * in the domain of time (CVW) or frequency (Bode and Nyquist).
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter
 * @param {string} dataType - "cvw", "bodeMod", "bodeAng" ou "nyquist"
 * 
 * Behavior:
 * - For CVW data, the filter is applied in the time domain using the scan rate and step size from dataset parameters.
 * - For EIS data (Bode and Nyquist), the filter is applied in the frequency domain.
 */
export const LowPass = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()
  const [passbandFrequency, setPassbandFrequency] = useState(50) // fp (Hz)
  const [filterType, setFilterType] = useState('Butterworth')
  const [gain, setGain] = useState(1)
  const [allowablePassbandRipple, setAllowablePassbandRipple] = useState(0.5) // Ap (dB)
  const [stopbandFrequency, setStopbandFrequency] = useState(100) // fs (Hz)
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

  // Complex helpers
  const complex = (re, im) => ({ re, im })
  const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im })
  const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
  const cdiv = (a, b) => {
    const den = b.re * b.re + b.im * b.im + 1e-24
    return { re: (a.re * b.re + a.im * b.im) / den, im: (a.im * b.re - a.re * b.im) / den }
  }
  const cmag = (c) => Math.sqrt(c.re * c.re + c.im * c.im)
  const cphase = (c) => Math.atan2(c.im, c.re) * 180 / Math.PI

  // Bilinear transform
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

  // IIR and biquad applicators
  const applyIIR = (data, sos) => {
    let out = [...data]
    for (const s of sos) out = applyBiquad(out, s)
    return out
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

  // estimate sampling frequency from axis spacing (Hz)
  function estimateFs(x) {
    if (!x || x.length < 2) return 1
    const diffs = []
    for (let i = 1; i < x.length; i++) diffs.push(Math.abs(x[i] - x[i - 1]))
    const meanStep = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return meanStep > 0 ? 1 / meanStep : 1
  }

  // RC single-pole filter (time-domain per-sample)
  function rcFilter(y, xAxis, cutoff, fs = 1, order = 1) {
    if (!y || y.length < 2) return []
    let resultY = [...y]
    const RC = 1 / (2 * Math.PI * Math.max(1e-12, cutoff))
    const dt = fs > 0 ? 1 / fs : 1
    const alpha = dt / (RC + dt)
    for (let k = 0; k < Math.max(1, order); k++) {
      const filtered = []
      filtered[0] = resultY[0]
      for (let i = 1; i < resultY.length; i++) {
        filtered[i] = filtered[i - 1] + alpha * (resultY[i] - filtered[i - 1])
      }
      resultY = filtered
    }
    return resultY
  }

  // --- Estimate order & design cutoff frequency
  const estimateOrderButterworth = (fp, fs, Ap, As) => {
    // same as previous: eps^2 = 10^(Ap/10) - 1
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
    // n >= acosh( sqrt(As/eps^2) ) / acosh(OmegaS)
    const top = Math.acosh(Math.sqrt(AsLin / eps2))
    const bot = Math.acosh(OmegaS)
    if (!isFinite(top) || !isFinite(bot) || bot === 0) return { order: 1, fc: fp_n }
    const nFloat = top / bot
    const n = Math.max(1, Math.ceil(nFloat))
    // choose design fc = fp (we normalize Chebyshev to fp as passband edge)
    return { order: n, fc: fp_n }
  }
  const estimateDesign = (type, fp, fs, Ap, As) => {
    if (type === 'Butterworth') return estimateOrderButterworth(fp, fs, Ap, As)
    if (type === 'Chebyshev I') return estimateOrderChebyshevI(fp, fs, Ap, As)
    // For Chebyshev II, Elliptic (Cauer), Bessel and Gaussian use approximations:
    // - Chebyshev II: estimate order as Chebyshev I (roughly comparable) and keep fc=fp.
    // - Cauer (Elliptic): use Chebyshev I order minus 1 (elliptic typically needs lower order) but add a small guard.
    // - Bessel and Gaussian: keep Butterworth-based order (they are smoother specs).
    if (type === 'Chebyshev II') {
      const r = estimateOrderChebyshevI(fp, fs, Ap, As)
      return { order: Math.max(1, r.order), fc: fp }
    }
    if (type === 'Cauer') {
      const r = estimateOrderChebyshevI(fp, fs, Ap, As)
      // elliptic often achieves specs with lower order; subtract 1 but min 1
      return { order: Math.max(1, r.order - 1), fc: fp }
    }
    // Bessel/Gaussian fallback
    return estimateOrderButterworth(fp, fs, Ap, As)
  }

  // get prototype poles for a given type (normalized, scaled by wc later)
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
      // Chebyshev I normalized poles (unscaled); requires epsilon
      // alpha = asinh(1/eps)/n
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
      // APPROXIMATION: use Chebyshev I poles but flip to approximate II characteristics
      // Exact Chebyshev II needs extra zeros on jΩs; for preview this is acceptable.
      const r = getPrototypePoles('Chebyshev I', order, epsilon)
      return r.map(p => ({ re: p.re, im: p.im }))
    }

    if (type === 'Cauer') {
      // APPROXIMATION: use Chebyshev I poles as a starting point (elliptic needs elliptic integrals)
      const r = getPrototypePoles('Chebyshev I', order, epsilon)
      // slightly move poles inward (more selectivity)
      return r.map(p => ({ re: p.re * 1.05, im: p.im * 1.05 }))
    }

    if (type === 'Bessel') {
      // APPROXIMATION: fallback to Butterworth poles shifted toward imaginary axis (to mimic Bessel)
      const r = getPrototypePoles('Butterworth', order, epsilon)
      return r.map(p => ({ re: p.re * 0.8, im: p.im * 1.2 }))
    }

    if (type === 'Gaussian') {
      // APPROXIMATION: Gaussian approx via mild-shifted Butterworth poles
      const r = getPrototypePoles('Butterworth', order, epsilon)
      return r.map((p, i) => ({ re: p.re * (1 - 0.05 * (i % 3)), im: p.im }))
    }

    // default to butterworth
    return getPrototypePoles('Butterworth', order, epsilon)
  }
  // from prototype poles build analog second-order (and first-order) sections scaled by wc
  const getAnalogSectionsFromPrototype = (type, order, wc, epsilon = 1) => {
    const pProto = getPrototypePoles(type, order, epsilon)
    // scale poles by wc
    const poles = pProto.map(p => ({ re: p.re * wc, im: p.im * wc }))
    const sections = []
    // pair conjugate poles into 2nd-order sections
    const used = new Array(poles.length).fill(false)
    for (let i = 0; i < poles.length; i++) {
      if (used[i]) continue
      const p = poles[i]
      // try to find conjugate
      let pairedIdx = -1
      for (let j = i + 1; j < poles.length; j++) {
        if (used[j]) continue
        const q = poles[j]
        // consider conjugate if re close and im opposite sign
        if (Math.abs(p.re - q.re) < 1e-6 && Math.abs(p.im + q.im) < 1e-6) {
          pairedIdx = j
          break
        }
      }
      if (pairedIdx >= 0) {
        const p2 = poles[pairedIdx]
        used[i] = used[pairedIdx] = true
        // denom: s^2 - (p+p2)s + p*p2  -> coefficients a0=1, a1=-(p.re+p2.re), a2 = p*p2 (re^2+im^2)
        const a0 = 1
        const a1 = - (p.re + p2.re)
        const a2 = p.re * p.re + p.im * p.im // p*p_conj = re^2 + im^2
        const b0 = 0
        const b1 = 0
        const b2 = wc * wc
        sections.push([b0, b1, b2, a0, a1, a2])
      } else {
        // unmatched single real pole -> first order section
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
  // H(jw) computed from prototype poles (useful for EIS domain)
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

    // compute design order & design cutoff depending on filter type
    const design = estimateDesign(filterType, passbandFrequency, stopbandFrequency, allowablePassbandRipple, stopbandAttenuation)
    const designOrder = design.order
    const designFc = design.fc
    const epsilon = Math.sqrt(Math.max(1e-12, Math.pow(10, allowablePassbandRipple / 10) - 1))

    if (filterType === 'Butterworth' || filterType === 'Chebyshev I' ||
        filterType === 'Chebyshev II' || filterType === 'Cauer' ||
        filterType === 'Bessel' || filterType === 'Gaussian') {
      // design analog sections from prototype (may be approximation for some types)
      const wc = 2 * Math.PI * designFc
      const analogSections = getAnalogSectionsFromPrototype(filterType, designOrder, wc, epsilon)
      const sos = analogSections.map(sec => bilinearTransform(sec, fs))

      if (dataType === 'cvw') {
        let resultY = applyIIR(visible.y, sos)
        if (gain !== 1) resultY = resultY.map(v => v * gain)
        setPreviewFilter({ x: [...visible.x], y: resultY })
        return
      }

      // EIS: apply in frequency domain via complex H multiplication
      if (dataType === 'bodeMod') {
        const omega = ds?.omega || visible.x
        const modZ = ds?.modZ || visible.y.map(v => Math.pow(10, v/20))
        const outY = []
        for (let i = 0; i < omega.length; i++) {
          const f = omega[i]
          const H = getComplexH_fromPrototype(filterType, f, { gain, cutoff: designFc, order: designOrder, epsilon })
          const mag = modZ[i] * cmag(H)
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
          const H = getComplexH_fromPrototype(filterType, f, { gain, cutoff: designFc, order: designOrder, epsilon })
          const newAngle = (angZ[i] || 0) + cphase(H)
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
          const H = getComplexH_fromPrototype(filterType, f, { gain, cutoff: designFc, order: designOrder, epsilon })
          const Zf = cmul(Z, H)
          outReal.push(Zf.re)
          outImag.push(Zf.im)
        }
        setPreviewFilter({ x: outReal, y: outImag })
        return
      }
    }

    // fallback safe behavior (shouldn't be reached)
    setPreviewFilter({ x: [...visible.x], y: [...visible.y] })
  }, [
    // design parameters
    passbandFrequency, allowablePassbandRipple, stopbandFrequency, stopbandAttenuation,
    // other params
    visible, setPreviewFilter, datasets, dataType, filterType, gain
  ])

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'background.paper', color: 'text.primary', height: '100%' }}>
        <Stack spacing={3}>
          {/* Filter Type Selector */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel id="lp-filter-type-label">Type of filter</InputLabel>
              <Select
                labelId="lp-filter-type-label"
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

          {/* Passband Frequency */}
          <Box>
            <TextField
              label="Passband Frequency (fp)"
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

          {/* Stopband Frequency */}
          <Box>
            <TextField
              label="Stopband Frequency (fs)"
              type="number"
              value={stopbandFrequency}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setStopbandFrequency(isNaN(val) ? 100 : Math.max(passbandFrequency + 1e-6, val))
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