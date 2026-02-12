// ===========================================
// APP DUEÑO - FUNCIONALIDAD ORIGINAL COMPLETA
// ===========================================

// CONFIGURACIÓN - CAMBIA ESTO POR TU URL DE RENDER
const API_URL = 'https://sistema-test-api.onrender.com'; // TU URL DE RENDER

const App = {
    productoActual: null,
    currentPage: 'dashboard',
    
    init() {
        this.setupEventListeners();
        this.testServerConnection();
        this.setupNavigation();
        this.setupSearch();
        this.setupDataManagementButtons();
    },
    
    // ========== NAVEGACIÓN ==========
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    },
    
    switchPage(page) {
        // Actualizar clase active en menú
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
        
        // Mostrar sección correspondiente
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${page}Section`).classList.add('active');
        
        // Controlar visibilidad del buscador
        const searchContainer = document.getElementById('searchContainer');
        if (page === 'vendedoras' || page === 'productos') {
            searchContainer.classList.add('visible');
            // Actualizar filtros según la sección
            this.updateFilterTabs(page);
            // Limpiar búsqueda
            document.getElementById('searchInput').value = '';
        } else {
            searchContainer.classList.remove('visible');
        }
        
        this.currentPage = page;
    },
    
    // ========== BÚSQUEDA ==========
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            const term = searchInput.value.toLowerCase();
            if (this.currentPage === 'vendedoras') {
                this.filterVendedoras(term);
            } else if (this.currentPage === 'productos') {
                this.filterProductos(term);
            }
        };
        
        searchInput.addEventListener('input', performSearch);
        searchBtn.addEventListener('click', performSearch);
    },
    
    updateFilterTabs(page) {
        const filterTabs = document.getElementById('filterTabs');
        if (page === 'vendedoras') {
            filterTabs.innerHTML = `
                <button class="filter-btn active" data-filter="todos">Todos</button>
                <button class="filter-btn" data-filter="activa">Activas</button>
                <button class="filter-btn" data-filter="inactiva">Inactivas</button>
            `;
            // Agregar eventos a filtros
            filterTabs.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterVendedorasByStatus(btn.dataset.filter);
                });
            });
        } else if (page === 'productos') {
            filterTabs.innerHTML = `
                <button class="filter-btn active" data-filter="todos">Todos</button>
                <button class="filter-btn" data-filter="disponible">Disponibles</button>
                <button class="filter-btn" data-filter="bajo-stock">Bajo Stock</button>
            `;
            filterTabs.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterProductosByStatus(btn.dataset.filter);
                });
            });
        }
    },
    
    // Filtros de vendedoras
    filterVendedoras(term) {
        // Esta función se implementará cuando tengamos las vendedoras cargadas
        // Por ahora solo es un placeholder
        console.log('Buscando vendedoras:', term);
    },
    
    filterVendedorasByStatus(status) {
        console.log('Filtrando vendedoras por:', status);
    },
    
    // Filtros de productos
    filterProductos(term) {
        console.log('Buscando productos:', term);
    },
    
    filterProductosByStatus(status) {
        console.log('Filtrando productos por:', status);
    },
    
    // ========== BOTONES DE GESTIÓN DE DATOS ==========
    setupDataManagementButtons() {
        document.getElementById('exportDataBtn')?.addEventListener('click', () => alert('Falta implementación'));
        document.getElementById('importDataLabel')?.addEventListener('click', () => alert('Falta implementación'));
        document.getElementById('syncAllBtn')?.addEventListener('click', () => alert('Falta implementación'));
        document.getElementById('clearDataBtn')?.addEventListener('click', () => alert('Falta implementación'));
        document.getElementById('generarReporteBtn')?.addEventListener('click', () => alert('Falta implementación'));
    },
    
    // ========== FUNCIONALIDADES ORIGINALES ==========
    async testServerConnection() {
        const statusDiv = document.getElementById('serverStatus');
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                statusDiv.className = 'status online';
                statusDiv.innerHTML = `✅ Conectado al servidor - ${data.mensaje} (Vendedoras: ${data.vendedoras}, Productos: ${data.productos})`;
                
                // Cargar datos automáticamente
                this.cargarVendedoras();
                this.cargarProducto();
            } else {
                throw new Error('Error en respuesta');
            }
        } catch (error) {
            console.error('Error conectando al servidor:', error);
            statusDiv.className = 'status offline';
            statusDiv.innerHTML = '❌ NO HAY CONEXIÓN CON EL SERVIDOR - Verifica que Render esté activo';
        }
    },
    
    setupEventListeners() {
        document.getElementById('btnTestServer')?.addEventListener('click', () => this.testServerConnection());
        document.getElementById('btnCargarVendedoras')?.addEventListener('click', () => this.cargarVendedoras());
        document.getElementById('btnCargarProducto')?.addEventListener('click', () => this.cargarProducto());
        document.getElementById('btnGuardarVendedora')?.addEventListener('click', () => this.guardarVendedora());
    },
    
    async cargarVendedoras() {
        const container = document.getElementById('vendedorasContainer');
        const countSpan = document.getElementById('vendedorasCount');
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras`);
            const vendedoras = await response.json();
            
            if (countSpan) countSpan.innerText = `(${vendedoras.length} vendedoras)`;
            
            if (vendedoras.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay vendedoras registradas</div>';
                return;
            }
            
            let html = '';
            vendedoras.forEach(v => {
                html += `
                    <div class="vendedora-card">
                        <div class="vendedora-header">
                            <div class="vendedora-avatar">${v.nombre.charAt(0)}</div>
                            <div class="vendedora-info">
                                <div class="vendedora-name">${v.nombre}</div>
                                <div class="vendedora-user">@${v.usuario}</div>
                            </div>
                            <span class="vendedora-status status-${v.status}">${v.status}</span>
                        </div>
                        <div class="vendedora-details">
                            <div class="detail-item">
                                <span class="detail-label">Tienda</span>
                                <span class="detail-value">${v.tienda}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ID</span>
                                <span class="detail-value">${v.id}</span>
                            </div>
                        </div>
                        <div class="vendedora-actions">
                            <button class="btn btn-sm btn-danger" onclick="App.eliminarVendedora('${v.id}')">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error cargando vendedoras:', error);
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando vendedoras</div>';
        }
    },
    
    async cargarProducto() {
        const container = document.getElementById('productoContainer');
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos`);
            const productos = await response.json();
            
            if (productos && productos.length > 0) {
                this.productoActual = productos[0];
                const p = this.productoActual;
                
                container.innerHTML = `
                    <div class="producto-card">
                        <div class="producto-header">
                            <div class="producto-name">${p.nombre}</div>
                            <span class="producto-status ${p.stock < 5 ? 'status-warning' : 'status-active'}">
                                ${p.status}
                            </span>
                        </div>
                        <div class="producto-details">
                            <div class="detail-item">
                                <span class="detail-label">Precio</span>
                                <span class="detail-value">$${p.precio.toFixed(2)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Stock</span>
                                <span class="detail-value ${p.stock < 5 ? 'stock-danger' : ''}">${p.stock}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ID</span>
                                <span class="detail-value">${p.id}</span>
                            </div>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                                <div style="flex: 1;">
                                    <label>Nombre</label>
                                    <input type="text" id="editNombre" value="${p.nombre}" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div style="width: 150px;">
                                    <label>Precio</label>
                                    <input type="number" id="editPrecio" value="${p.precio}" step="0.01" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div style="width: 120px;">
                                    <label>Stock</label>
                                    <input type="number" id="editStock" value="${p.stock}" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div>
                                    <button onclick="App.actualizarProducto()" class="btn btn-primary" style="margin-top: 20px;">Actualizar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay productos disponibles</div>';
            }
        } catch (error) {
            console.error('Error cargando producto:', error);
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando producto</div>';
        }
    },
    
    async guardarVendedora() {
        const nombre = document.getElementById('vendedoraNombre').value.trim();
        const usuario = document.getElementById('vendedoraUsuario').value.trim();
        const password = document.getElementById('vendedoraPassword').value.trim();
        const tienda = document.getElementById('vendedoraTienda').value.trim() || 'Tienda General';
        
        const resultado = document.getElementById('vendedoraResultado');
        
        if (!nombre || !usuario || !password) {
            resultado.style.display = 'block';
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Nombre, usuario y contraseña son obligatorios';
            return;
        }
        
        resultado.style.display = 'block';
        resultado.style.background = '#fff3cd';
        resultado.style.color = '#856404';
        resultado.innerHTML = '⏳ Guardando vendedora...';
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, usuario, password, tienda })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                resultado.style.background = '#d4edda';
                resultado.style.color = '#155724';
                resultado.innerHTML = `✅ Vendedora creada: ${data.vendedora.nombre} (@${data.vendedora.usuario})`;
                
                // Limpiar formulario
                document.getElementById('vendedoraNombre').value = '';
                document.getElementById('vendedoraUsuario').value = '';
                document.getElementById('vendedoraPassword').value = '123456';
                document.getElementById('vendedoraTienda').value = '';
                
                // Recargar lista
                this.cargarVendedoras();
            } else {
                resultado.style.background = '#f8d7da';
                resultado.style.color = '#721c24';
                resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear la vendedora'}`;
            }
        } catch (error) {
            console.error('Error guardando vendedora:', error);
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Error de conexión con el servidor';
        }
    },
    
    async actualizarProducto() {
        const nombre = document.getElementById('editNombre')?.value;
        const precio = document.getElementById('editPrecio')?.value;
        const stock = document.getElementById('editStock')?.value;
        
        if (!this.productoActual) return;
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos/${this.productoActual.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, stock })
            });
            
            if (response.ok) {
                this.cargarProducto();
                alert('✅ Producto actualizado correctamente');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            alert('❌ Error actualizando producto');
        }
    },
    
    async eliminarVendedora(id) {
        if (!confirm('¿Eliminar esta vendedora?')) return;
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.cargarVendedoras();
            }
        } catch (error) {
            console.error('Error eliminando vendedora:', error);
            alert('❌ Error eliminando vendedora');
        }
    }
};

// Iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});