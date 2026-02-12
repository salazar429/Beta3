// ===========================================
// APP DUEÑO - FUNCIONALIDAD COMPLETA
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
        this.setupToggleForms();
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
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${page}Section`).classList.add('active');
        
        const searchContainer = document.getElementById('searchContainer');
        if (page === 'vendedoras' || page === 'productos') {
            searchContainer.classList.add('visible');
            this.updateFilterTabs(page);
            document.getElementById('searchInput').value = '';
        } else {
            searchContainer.classList.remove('visible');
        }
        
        this.currentPage = page;
    },
    
    // ========== TOGGLE FORMULARIOS ==========
    setupToggleForms() {
        // Toggle formulario vendedora
        const btnToggleVendedora = document.getElementById('btnToggleFormVendedora');
        const formVendedora = document.getElementById('formAgregarVendedora');
        if (btnToggleVendedora) {
            btnToggleVendedora.addEventListener('click', () => {
                formVendedora.classList.toggle('visible');
                btnToggleVendedora.innerHTML = formVendedora.classList.contains('visible') 
                    ? '<span>✖️</span><span>Cerrar</span>' 
                    : '<span>➕</span><span>Agregar Vendedora</span>';
            });
        }
        
        // Toggle formulario producto
        const btnToggleProducto = document.getElementById('btnToggleFormProducto');
        const formProducto = document.getElementById('formAgregarProducto');
        if (btnToggleProducto) {
            btnToggleProducto.addEventListener('click', () => {
                formProducto.classList.toggle('visible');
                btnToggleProducto.innerHTML = formProducto.classList.contains('visible') 
                    ? '<span>✖️</span><span>Cerrar</span>' 
                    : '<span>➕</span><span>Agregar Producto</span>';
            });
        }
    },
    
    // ========== BÚSQUEDA Y FILTROS ==========
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
        if (!filterTabs) return;
        
        if (page === 'vendedoras') {
            filterTabs.innerHTML = `
                <button class="filter-btn active" data-filter="todos">Todos</button>
                <button class="filter-btn" data-filter="activa">Activas</button>
                <button class="filter-btn" data-filter="inactiva">Inactivas</button>
            `;
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
        const cards = document.querySelectorAll('#vendedorasContainer .vendedora-card');
        cards.forEach(card => {
            const nombre = card.querySelector('.vendedora-name')?.textContent.toLowerCase() || '';
            const usuario = card.querySelector('.vendedora-user')?.textContent.toLowerCase() || '';
            const tienda = card.querySelector('.detail-value')?.textContent.toLowerCase() || '';
            
            if (nombre.includes(term) || usuario.includes(term) || tienda.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },
    
    filterVendedorasByStatus(status) {
        const cards = document.querySelectorAll('#vendedorasContainer .vendedora-card');
        if (status === 'todos') {
            cards.forEach(card => card.style.display = 'block');
            return;
        }
        
        cards.forEach(card => {
            const statusBadge = card.querySelector('.vendedora-status');
            if (statusBadge && statusBadge.textContent.toLowerCase() === status) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },
    
    // Filtros de productos
    filterProductos(term) {
        const cards = document.querySelectorAll('#productosContainer .producto-card');
        cards.forEach(card => {
            const nombre = card.querySelector('.producto-name')?.textContent.toLowerCase() || '';
            if (nombre.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },
    
    filterProductosByStatus(status) {
        const cards = document.querySelectorAll('#productosContainer .producto-card');
        if (status === 'todos') {
            cards.forEach(card => card.style.display = 'block');
            return;
        }
        
        cards.forEach(card => {
            const stockEl = card.querySelector('.detail-value.stock-danger, .detail-value:not(.stock-danger)');
            const stock = parseInt(stockEl?.textContent || '0');
            
            if (status === 'disponible' && stock > 5) {
                card.style.display = 'block';
            } else if (status === 'bajo-stock' && stock <= 5 && stock > 0) {
                card.style.display = 'block';
            } else if (status === 'bajo-stock' && stock === 0) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
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
                
                this.cargarVendedoras();
                this.cargarProductos();
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
        document.getElementById('btnCargarProductos')?.addEventListener('click', () => this.cargarProductos());
        document.getElementById('btnGuardarVendedora')?.addEventListener('click', () => this.guardarVendedora());
        document.getElementById('btnGuardarProducto')?.addEventListener('click', () => this.guardarProducto());
    },
    
    // ========== VENDEDORAS ==========
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
            
            // Ordenar: primero inactivas, luego activas
            const ordenadas = [...vendedoras].sort((a, b) => {
                if (a.status === 'inactiva' && b.status === 'activa') return -1;
                if (a.status === 'activa' && b.status === 'inactiva') return 1;
                return 0;
            });
            
            let html = '';
            ordenadas.forEach(v => {
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
                
                document.getElementById('vendedoraNombre').value = '';
                document.getElementById('vendedoraUsuario').value = '';
                document.getElementById('vendedoraPassword').value = '123456';
                document.getElementById('vendedoraTienda').value = '';
                
                this.cargarVendedoras();
                
                // Cerrar formulario después de guardar
                document.getElementById('formAgregarVendedora').classList.remove('visible');
                document.getElementById('btnToggleFormVendedora').innerHTML = '<span>➕</span><span>Agregar Vendedora</span>';
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
    },
    
    // ========== PRODUCTOS ==========
    async cargarProductos() {
        const container = document.getElementById('productosContainer');
        const countSpan = document.getElementById('productosCount');
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos`);
            const productos = await response.json();
            
            if (countSpan) countSpan.innerText = `(${productos.length} productos)`;
            
            if (!productos || productos.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay productos disponibles</div>';
                return;
            }
            
            let html = '';
            productos.forEach(p => {
                const stockClass = p.stock < 5 ? 'stock-danger' : '';
                const statusClass = p.stock < 5 ? 'status-warning' : 'status-active';
                
                html += `
                    <div class="producto-card" data-producto-id="${p.id}">
                        <div class="producto-header">
                            <div class="producto-name">${p.nombre}</div>
                            <span class="producto-status ${statusClass}">
                                ${p.stock === 0 ? 'SIN STOCK' : p.stock < 5 ? 'BAJO STOCK' : 'DISPONIBLE'}
                            </span>
                        </div>
                        <div class="producto-details">
                            <div class="detail-item">
                                <span class="detail-label">Precio</span>
                                <span class="detail-value">$${p.precio.toFixed(2)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Stock</span>
                                <span class="detail-value ${stockClass}">${p.stock}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Categoría</span>
                                <span class="detail-value">${p.categoria || 'General'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ID</span>
                                <span class="detail-value">${p.id}</span>
                            </div>
                        </div>
                        <div class="producto-actions">
                            <button class="btn btn-sm btn-primary" onclick="App.toggleEditProducto('${p.id}')">✏️ Modificar</button>
                            <button class="btn btn-sm btn-danger" onclick="App.eliminarProducto('${p.id}')">🗑️ Eliminar</button>
                        </div>
                        
                        <!-- Formulario de edición (oculto inicialmente) -->
                        <div id="edit-form-${p.id}" class="edit-producto-form">
                            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                                <div style="flex: 1;">
                                    <label>Nombre</label>
                                    <input type="text" id="editNombre-${p.id}" value="${p.nombre}" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div style="width: 150px;">
                                    <label>Precio</label>
                                    <input type="number" id="editPrecio-${p.id}" value="${p.precio}" step="0.01" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div style="width: 120px;">
                                    <label>Stock</label>
                                    <input type="number" id="editStock-${p.id}" value="${p.stock}" class="form-control" style="margin-top: 5px;">
                                </div>
                                <div>
                                    <button onclick="App.actualizarProducto('${p.id}')" class="btn btn-success" style="margin-top: 20px;">Guardar</button>
                                    <button onclick="App.toggleEditProducto('${p.id}')" class="btn btn-secondary" style="margin-top: 20px;">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando productos</div>';
        }
    },
    
    toggleEditProducto(id) {
        const form = document.getElementById(`edit-form-${id}`);
        if (form) {
            form.classList.toggle('visible');
        }
    },
    
    async guardarProducto() {
        const nombre = document.getElementById('productoNombre').value.trim();
        const categoria = document.getElementById('productoCategoria').value;
        const precio = parseFloat(document.getElementById('productoPrecio').value);
        const stock = parseInt(document.getElementById('productoStock').value);
        const minStock = parseInt(document.getElementById('productoMinStock').value) || 5;
        
        const resultado = document.getElementById('productoResultado');
        
        if (!nombre || !precio || !stock) {
            resultado.style.display = 'block';
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Nombre, precio y stock son obligatorios';
            return;
        }
        
        resultado.style.display = 'block';
        resultado.style.background = '#fff3cd';
        resultado.style.color = '#856404';
        resultado.innerHTML = '⏳ Guardando producto...';
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, 
                    categoria, 
                    precio, 
                    stock, 
                    minStock,
                    status: stock > minStock ? 'disponible' : 'bajo-stock'
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                resultado.style.background = '#d4edda';
                resultado.style.color = '#155724';
                resultado.innerHTML = `✅ Producto creado: ${data.producto.nombre}`;
                
                document.getElementById('productoNombre').value = '';
                document.getElementById('productoPrecio').value = '';
                document.getElementById('productoStock').value = '';
                document.getElementById('productoMinStock').value = '5';
                
                this.cargarProductos();
                
                // Cerrar formulario
                document.getElementById('formAgregarProducto').classList.remove('visible');
                document.getElementById('btnToggleFormProducto').innerHTML = '<span>➕</span><span>Agregar Producto</span>';
            } else {
                resultado.style.background = '#f8d7da';
                resultado.style.color = '#721c24';
                resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear el producto'}`;
            }
        } catch (error) {
            console.error('Error guardando producto:', error);
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Error de conexión con el servidor';
        }
    },
    
    async actualizarProducto(id) {
        const nombre = document.getElementById(`editNombre-${id}`)?.value;
        const precio = parseFloat(document.getElementById(`editPrecio-${id}`)?.value);
        const stock = parseInt(document.getElementById(`editStock-${id}`)?.value);
        
        if (!nombre || !precio || !stock) {
            alert('❌ Todos los campos son obligatorios');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, stock })
            });
            
            if (response.ok) {
                this.cargarProductos();
                alert('✅ Producto actualizado correctamente');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            alert('❌ Error actualizando producto');
        }
    },
    
    async eliminarProducto(id) {
        if (!confirm('¿Eliminar este producto?')) return;
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.cargarProductos();
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('❌ Error eliminando producto');
        }
    }
};

// Iniciar app
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
