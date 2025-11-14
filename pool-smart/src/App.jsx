import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    // Información del cliente
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    // Dimensiones
    length: '',
    width: '',
    depth: '',
    poolType: 'rectangular',
    // Tipo de trabajo
    workType: 'construction', // construction, repair, maintenance, renovation
    // Materiales
    materials: {
      ceramics: true,
      thermalFloor: true,
      pump: false,
      filter: false,
      lighting: false,
      heating: false,
      cover: false,
      ladder: false,
      tiles: 'standard' // standard, premium, luxury
    },
    // Reparaciones específicas
    repairs: {
      leaks: false,
      cracks: false,
      coating: false,
      plumbing: false,
      electrical: false,
      cleaning: false
    },
    // Mano de obra
    laborHours: '',
    laborRate: 50, // USD por hora
    // Otros factores
    accessDifficulty: 'normal', // easy, normal, difficult
    permits: false,
    excavation: true,
    additionalNotes: ''
  })

  const [showModal, setShowModal] = useState(false)
  const [quoteData, setQuoteData] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('materials.')) {
      const materialKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        materials: {
          ...prev.materials,
          [materialKey]: type === 'checkbox' ? checked : value
        }
      }))
    } else if (name.startsWith('repairs.')) {
      const repairKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        repairs: {
          ...prev.repairs,
          [repairKey]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const calculateQuote = (e) => {
    e.preventDefault()
    
    const length = parseFloat(formData.length) || 0
    const width = parseFloat(formData.width) || 0
    const depth = parseFloat(formData.depth) || 0

    if (length <= 0 || width <= 0 || depth <= 0) {
      alert('Por favor, ingrese valores válidos mayores a cero')
      return
    }

    // Calcular metros cúbicos
    let volume = 0
    if (formData.poolType === 'rectangular') {
      volume = length * width * depth
    } else if (formData.poolType === 'circular') {
      const radius = width / 2
      volume = Math.PI * radius * radius * depth
    } else if (formData.poolType === 'oval') {
      const radius = width / 2
      volume = Math.PI * radius * radius * depth
    }

    // Calcular metros cuadrados de cerámicos (área del fondo + paredes)
    let ceramicArea = 0
    if (formData.poolType === 'rectangular') {
      const bottomArea = length * width
      const wallsArea = 2 * (length * depth) + 2 * (width * depth)
      ceramicArea = bottomArea + wallsArea
    } else if (formData.poolType === 'circular' || formData.poolType === 'oval') {
      const radius = width / 2
      const bottomArea = Math.PI * radius * radius
      const wallsArea = 2 * Math.PI * radius * depth
      ceramicArea = bottomArea + wallsArea
    }

    // Calcular metros cuadrados de pisos térmicos (área del fondo)
    let thermalFloorArea = 0
    if (formData.poolType === 'rectangular') {
      thermalFloorArea = length * width
    } else if (formData.poolType === 'circular' || formData.poolType === 'oval') {
      const radius = width / 2
      thermalFloorArea = Math.PI * radius * radius
    }

    // Costo por metro cúbico ($300)
    const costPerCubicMeter = 300
    const totalCost = volume * costPerCubicMeter

    // Calcular costos de materiales
    const materialCosts = []
    let totalMaterialCost = 0

    // Cerámicos
    if (formData.materials.ceramics) {
      const tilePrice = formData.materials.tiles === 'premium' ? 75 : formData.materials.tiles === 'luxury' ? 120 : 50
      const ceramicCost = parseFloat(ceramicArea) * tilePrice
      materialCosts.push({
        name: `Cerámicos ${formData.materials.tiles === 'premium' ? 'Premium' : formData.materials.tiles === 'luxury' ? 'Lujo' : 'Estándar'}`,
        quantity: parseFloat(ceramicArea).toFixed(2),
        unit: 'm²',
        unitPrice: tilePrice,
        total: ceramicCost
      })
      totalMaterialCost += ceramicCost
    }

    // Pisos térmicos
    if (formData.materials.thermalFloor) {
      const thermalCost = parseFloat(thermalFloorArea) * 80
      materialCosts.push({
        name: 'Pisos térmicos',
        quantity: parseFloat(thermalFloorArea).toFixed(2),
        unit: 'm²',
        unitPrice: 80,
        total: thermalCost
      })
      totalMaterialCost += thermalCost
    }

    // Equipos adicionales
    const equipmentPrices = {
      pump: 800,
      filter: 600,
      lighting: 300,
      heating: 2500,
      cover: 400,
      ladder: 250
    }

    Object.keys(equipmentPrices).forEach(key => {
      if (formData.materials[key]) {
        materialCosts.push({
          name: key === 'pump' ? 'Bomba de agua' : 
                key === 'filter' ? 'Sistema de filtrado' :
                key === 'lighting' ? 'Iluminación LED' :
                key === 'heating' ? 'Sistema de calefacción' :
                key === 'cover' ? 'Cubierta de seguridad' :
                'Escalera',
          quantity: 1,
          unit: 'unidad',
          unitPrice: equipmentPrices[key],
          total: equipmentPrices[key]
        })
        totalMaterialCost += equipmentPrices[key]
      }
    })

    // Calcular costos de construcción/reparación
    const workCosts = []
    let totalWorkCost = 0

    if (formData.workType === 'construction') {
      const baseConstructionCost = volume * costPerCubicMeter
      const excavationCost = formData.excavation ? volume * 50 : 0
      workCosts.push({
        name: 'Construcción de piscina',
        quantity: volume.toFixed(2),
        unit: 'm³',
        unitPrice: costPerCubicMeter,
        total: baseConstructionCost
      })
      if (excavationCost > 0) {
        workCosts.push({
          name: 'Excavación',
          quantity: volume.toFixed(2),
          unit: 'm³',
          unitPrice: 50,
          total: excavationCost
        })
      }
      totalWorkCost = baseConstructionCost + excavationCost
    } else if (formData.workType === 'repair') {
      // Costos de reparaciones específicas
      const repairPrices = {
        leaks: { base: 500, perM2: 30 },
        cracks: { base: 400, perM2: 25 },
        coating: { base: 800, perM2: 50 },
        plumbing: { base: 600, perM2: 0 },
        electrical: { base: 500, perM2: 0 },
        cleaning: { base: 200, perM2: 10 }
      }

      Object.keys(repairPrices).forEach(key => {
        if (formData.repairs[key]) {
          const repair = repairPrices[key]
          const repairCost = repair.base + (repair.perM2 * parseFloat(ceramicArea))
          workCosts.push({
            name: key === 'leaks' ? 'Reparación de filtraciones' :
                  key === 'cracks' ? 'Reparación de grietas' :
                  key === 'coating' ? 'Revestimiento' :
                  key === 'plumbing' ? 'Reparación de plomería' :
                  key === 'electrical' ? 'Reparación eléctrica' :
                  'Limpieza profunda',
            quantity: 1,
            unit: 'servicio',
            unitPrice: repairCost,
            total: repairCost
          })
          totalWorkCost += repairCost
        }
      })
    } else if (formData.workType === 'renovation') {
      const renovationCost = parseFloat(ceramicArea) * 60
      workCosts.push({
        name: 'Renovación completa',
        quantity: parseFloat(ceramicArea).toFixed(2),
        unit: 'm²',
        unitPrice: 60,
        total: renovationCost
      })
      totalWorkCost = renovationCost
    }

    // Calcular mano de obra
    const laborHours = parseFloat(formData.laborHours) || 0
    let laborCost = 0
    if (laborHours > 0) {
      laborCost = laborHours * formData.laborRate
      workCosts.push({
        name: 'Mano de obra',
        quantity: laborHours.toFixed(1),
        unit: 'horas',
        unitPrice: formData.laborRate,
        total: laborCost
      })
      totalWorkCost += laborCost
    } else {
      // Calcular horas estimadas automáticamente
      const estimatedHours = formData.workType === 'construction' 
        ? Math.ceil(volume * 2) 
        : formData.workType === 'repair' 
        ? Object.values(formData.repairs).filter(r => r).length * 4
        : 8
      laborCost = estimatedHours * formData.laborRate
      workCosts.push({
        name: 'Mano de obra (estimada)',
        quantity: estimatedHours.toFixed(1),
        unit: 'horas',
        unitPrice: formData.laborRate,
        total: laborCost
      })
      totalWorkCost += laborCost
    }

    // Costos adicionales
    const additionalCosts = []
    let totalAdditionalCost = 0

    // Dificultad de acceso
    const accessMultiplier = formData.accessDifficulty === 'difficult' ? 1.3 : formData.accessDifficulty === 'easy' ? 0.9 : 1.0
    if (accessMultiplier !== 1.0) {
      const accessCost = (totalMaterialCost + totalWorkCost) * (accessMultiplier - 1.0)
      additionalCosts.push({
        name: `Recargo por acceso ${formData.accessDifficulty === 'difficult' ? 'difícil' : 'fácil'}`,
        quantity: 1,
        unit: 'servicio',
        unitPrice: accessCost,
        total: accessCost
      })
      totalAdditionalCost += accessCost
    }

    // Permisos
    if (formData.permits) {
      additionalCosts.push({
        name: 'Permisos y licencias',
        quantity: 1,
        unit: 'servicio',
        unitPrice: 500,
        total: 500
      })
      totalAdditionalCost += 500
    }

    // Calcular totales
    const subtotal = totalMaterialCost + totalWorkCost + totalAdditionalCost
    const discount = 0
    const finalTotal = subtotal - discount

    setQuoteData({
      volume: volume.toFixed(2),
      ceramicArea: ceramicArea.toFixed(2),
      thermalFloorArea: thermalFloorArea.toFixed(2),
      materialCosts,
      workCosts,
      additionalCosts,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      totalCost: finalTotal.toFixed(2),
      clientName: formData.clientName || 'Cliente',
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      poolType: formData.poolType,
      workType: formData.workType,
      dimensions: {
        length: formData.length,
        width: formData.width,
        depth: formData.depth
      },
      date: new Date().toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      additionalNotes: formData.additionalNotes
    })
    
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      length: '',
      width: '',
      depth: '',
      poolType: 'rectangular',
      workType: 'construction',
      materials: {
        ceramics: true,
        thermalFloor: true,
        pump: false,
        filter: false,
        lighting: false,
        heating: false,
        cover: false,
        ladder: false,
        tiles: 'standard'
      },
      repairs: {
        leaks: false,
        cracks: false,
        coating: false,
        plumbing: false,
        electrical: false,
        cleaning: false
      },
      laborHours: '',
      laborRate: 50,
      accessDifficulty: 'normal',
      permits: false,
      excavation: true,
      additionalNotes: ''
    })
    setQuoteData(null)
    setShowModal(false)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>🏊 Pool Smart</h1>
        <p className="subtitle">Cotizador de Piscinas</p>
      </div>

      <div className="form-container">
        <form onSubmit={calculateQuote} className="quote-form">
          <h2 className="form-section-title">Información del Cliente</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Nombre Completo</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientEmail">Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="Ej: juan@email.com"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientPhone">Teléfono</label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="Ej: (316) 212-3456"
                className="form-input"
                required
              />
            </div>
          </div>

          <h2 className="form-section-title">Tipo de Trabajo</h2>
          <div className="form-group">
            <label htmlFor="workType">Seleccione el tipo de trabajo</label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="construction">Construcción Nueva</option>
              <option value="repair">Reparación</option>
              <option value="renovation">Renovación</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          <h2 className="form-section-title">Dimensiones de la Piscina</h2>
          <div className="form-group">
            <label htmlFor="poolType">Tipo de Piscina</label>
            <select
              id="poolType"
              name="poolType"
              value={formData.poolType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="rectangular">Rectangular</option>
              <option value="circular">Circular</option>
              <option value="oval">Oval</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="length">
                {formData.poolType === 'rectangular' ? 'Largo (m)' : 'Diámetro Mayor (m)'}
              </label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="Ej: 10.00"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="width">
                {formData.poolType === 'rectangular' ? 'Ancho (m)' : 'Diámetro Menor (m)'}
              </label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="Ej: 5.00"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="depth">Profundidad (m)</label>
              <input
                type="number"
                id="depth"
                name="depth"
                value={formData.depth}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="Ej: 1.50"
                className="form-input"
                required
              />
            </div>
          </div>

          {formData.workType === 'repair' && (
            <>
              <h2 className="form-section-title">Reparaciones Específicas</h2>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.leaks"
                    checked={formData.repairs.leaks}
                    onChange={handleChange}
                  />
                  <span>Reparación de filtraciones</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.cracks"
                    checked={formData.repairs.cracks}
                    onChange={handleChange}
                  />
                  <span>Reparación de grietas</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.coating"
                    checked={formData.repairs.coating}
                    onChange={handleChange}
                  />
                  <span>Revestimiento</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.plumbing"
                    checked={formData.repairs.plumbing}
                    onChange={handleChange}
                  />
                  <span>Reparación de plomería</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.electrical"
                    checked={formData.repairs.electrical}
                    onChange={handleChange}
                  />
                  <span>Reparación eléctrica</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="repairs.cleaning"
                    checked={formData.repairs.cleaning}
                    onChange={handleChange}
                  />
                  <span>Limpieza profunda</span>
                </label>
              </div>
            </>
          )}

          <h2 className="form-section-title">Materiales</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.ceramics"
                checked={formData.materials.ceramics}
                onChange={handleChange}
              />
              <span>Cerámicos</span>
            </label>
            {formData.materials.ceramics && (
              <div className="form-group" style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                <label htmlFor="materials.tiles">Calidad de cerámicos</label>
                <select
                  id="materials.tiles"
                  name="materials.tiles"
                  value={formData.materials.tiles}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="standard">Estándar ($50/m²)</option>
                  <option value="premium">Premium ($75/m²)</option>
                  <option value="luxury">Lujo ($120/m²)</option>
                </select>
              </div>
            )}
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.thermalFloor"
                checked={formData.materials.thermalFloor}
                onChange={handleChange}
              />
              <span>Pisos térmicos</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.pump"
                checked={formData.materials.pump}
                onChange={handleChange}
              />
              <span>Bomba de agua</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.filter"
                checked={formData.materials.filter}
                onChange={handleChange}
              />
              <span>Sistema de filtrado</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.lighting"
                checked={formData.materials.lighting}
                onChange={handleChange}
              />
              <span>Iluminación LED</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.heating"
                checked={formData.materials.heating}
                onChange={handleChange}
              />
              <span>Sistema de calefacción</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.cover"
                checked={formData.materials.cover}
                onChange={handleChange}
              />
              <span>Cubierta de seguridad</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="materials.ladder"
                checked={formData.materials.ladder}
                onChange={handleChange}
              />
              <span>Escalera</span>
            </label>
          </div>

          <h2 className="form-section-title">Mano de Obra</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="laborHours">Horas de trabajo (opcional, se calculará automáticamente si se deja vacío)</label>
              <input
                type="number"
                id="laborHours"
                name="laborHours"
                value={formData.laborHours}
                onChange={handleChange}
                step="0.5"
                min="0"
                placeholder="Ej: 40"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="laborRate">Tarifa por hora (USD)</label>
              <input
                type="number"
                id="laborRate"
                name="laborRate"
                value={formData.laborRate}
                onChange={handleChange}
                step="5"
                min="30"
                placeholder="50"
                className="form-input"
              />
            </div>
          </div>

          {formData.workType === 'construction' && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="excavation"
                  checked={formData.excavation}
                  onChange={handleChange}
                />
                <span>Incluir excavación</span>
              </label>
            </div>
          )}

          <h2 className="form-section-title">Otros Factores</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accessDifficulty">Dificultad de acceso</label>
              <select
                id="accessDifficulty"
                name="accessDifficulty"
                value={formData.accessDifficulty}
                onChange={handleChange}
                className="form-input"
              >
                <option value="easy">Fácil</option>
                <option value="normal">Normal</option>
                <option value="difficult">Difícil</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label" style={{ marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  name="permits"
                  checked={formData.permits}
                  onChange={handleChange}
                />
                <span>Incluir permisos y licencias</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Notas adicionales (opcional)</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Información adicional sobre el proyecto..."
              className="form-input"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Calcular Cotización
            </button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {showModal && quoteData && (
        <QuoteModal 
          quoteData={quoteData} 
          onClose={closeModal}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  )
}

function QuoteModal({ quoteData, onClose, formatCurrency }) {
  const poolTypeNames = {
    rectangular: 'Rectangular',
    circular: 'Circular',
    oval: 'Oval'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="quote-document">
          {/* Header con ondas */}
          <div className="quote-header-wave">
            <div className="quote-header">
              <div className="quote-logo-section">
                <div className="quote-logo">🏊</div>
                <div className="quote-company">
                  <div className="quote-company-label">Nombre de</div>
                  <div className="quote-company-name">tu empresa</div>
                </div>
              </div>
              <div className="quote-date">{quoteData.date}</div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="quote-client-info">
            <div className="quote-client-name">{quoteData.clientName}</div>
            {quoteData.clientEmail && (
              <div className="quote-client-detail">{quoteData.clientEmail}</div>
            )}
            {quoteData.clientPhone && (
              <div className="quote-client-detail">{quoteData.clientPhone}</div>
            )}
          </div>

          {/* Información del proyecto */}
          <div className="quote-project-info">
            <div className="quote-project-detail">
              <strong>Tipo de trabajo:</strong> {
                quoteData.workType === 'construction' ? 'Construcción Nueva' :
                quoteData.workType === 'repair' ? 'Reparación' :
                quoteData.workType === 'renovation' ? 'Renovación' :
                'Mantenimiento'
              }
            </div>
            <div className="quote-project-detail">
              <strong>Piscina:</strong> {poolTypeNames[quoteData.poolType]} - {quoteData.dimensions.length}m × {quoteData.dimensions.width}m × {quoteData.dimensions.depth}m
            </div>
            <div className="quote-project-detail">
              <strong>Volumen:</strong> {quoteData.volume} m³ | <strong>Área cerámica:</strong> {quoteData.ceramicArea} m²
            </div>
          </div>

          {/* Tabla de materiales */}
          {quoteData.materialCosts && quoteData.materialCosts.length > 0 && (
            <>
              <h3 className="quote-table-title">Materiales</h3>
              <div className="quote-table-container">
                <table className="quote-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Und</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.materialCosts.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tabla de trabajo */}
          {quoteData.workCosts && quoteData.workCosts.length > 0 && (
            <>
              <h3 className="quote-table-title">Construcción y Mano de Obra</h3>
              <div className="quote-table-container">
                <table className="quote-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Und</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.workCosts.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tabla de costos adicionales */}
          {quoteData.additionalCosts && quoteData.additionalCosts.length > 0 && (
            <>
              <h3 className="quote-table-title">Costos Adicionales</h3>
              <div className="quote-table-container">
                <table className="quote-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Und</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.additionalCosts.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Resumen de costos */}
          <div className="quote-summary">
            <div className="quote-summary-row">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(quoteData.subtotal)}</span>
            </div>
            {parseFloat(quoteData.discount) > 0 && (
              <div className="quote-summary-row discount">
                <span>DESCUENTO 10%</span>
                <span>{formatCurrency(quoteData.discount)}</span>
              </div>
            )}
            <div className="quote-summary-total">
              <span>TOTAL:</span>
              <span>{formatCurrency(quoteData.totalCost)}</span>
            </div>
          </div>

          {/* Nota y firma */}
          <div className="quote-footer-section">
            <div className="quote-notes">
              <strong>Nota:</strong> La cotización es válida por 7 días. La fecha de ejecución del servicio se coordinará según disponibilidad.
              {quoteData.additionalNotes && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Notas adicionales:</strong> {quoteData.additionalNotes}
                </div>
              )}
            </div>
            <div className="quote-signature">
              <div className="quote-signature-line"></div>
              <div className="quote-signature-id">C.C 0000000000</div>
            </div>
          </div>

          {/* Footer con ondas */}
          <div className="quote-footer-wave">
            <div className="quote-footer-content">
              {quoteData.clientPhone && (
                <span className="quote-footer-item">📞 {quoteData.clientPhone}</span>
              )}
              {quoteData.clientEmail && (
                <span className="quote-footer-item">✉️ {quoteData.clientEmail}</span>
              )}
              <span className="quote-footer-item">@poolsmart</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => window.print()}>
            Imprimir Presupuesto
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
