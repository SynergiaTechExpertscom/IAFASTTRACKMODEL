        // --- ESTADO DE LA APLICACIÓN ---
        let clientData = {};
        let catalogData = {};
        let currentSelectedClientId = null;

        let currentFilter = "All";
        let currentSubcategoryFilter = "AllSubcategories";
        let currentSelectedSolutionId = null;
        let selectedPilot = {
            name: "",
            description: "",
            technology: "",
            valueProposition: "",
            salesPitch: "",
            kpis: [],
            monthlyROI: [],

            currentProcessDescription: "",
            attachedFileNames: [],
            selectedProcessNameContent: "",
            selectedProcessDescriptionContent: "",
            selectedProcessTechnologyContent: [],  // Now an array for checkboxes

            originalProjectData: null,
            originalCategoryName: null,
            originalSubcategoryName: null,
            archivos_adjuntos: []
        };
        let csrfToken = null;

        let scoringGlobalChartInstance = null;
        let transformacionChartInstance = null;
        let procesosChartInstance = null;

        // --- COLORES PARA CATEGORÍAS ---
        const categoryColorStyles = {
            "Finanzas y Contabilidad": { bg: '#059669', text: '#D1FAE5', iconFill: '#6EE7B7', border: '#047857' }, // emerald
            "Recursos Humanos": { bg: '#0284C7', text: '#E0F2FE', iconFill: '#7DD3FC', border: '#0369A1' }, // sky
            "Atención al Cliente": { bg: '#D97706', text: '#FEF3C7', iconFill: '#FDBA74', border: '#B45309' }, // amber
            "Operaciones y Cadena de Suministro": { bg: '#BE185D', text: '#FCE7F3', iconFill: '#F9A8D4', border: '#9D174D' }, // rose
            "Ventas y Marketing": { bg: '#A21CAF', text: '#FAE8FF', iconFill: '#F0ABFC', border: '#86198F' }, // fuchsia
            "Analítica y Datos": { bg: '#4F46E5', text: '#EEF2FF', iconFill: '#A5B4FC', border: '#4338CA' }, // indigo
            "Sugeridos": { bg: '#F59E0B', text: '#FFFBEB', iconFill: '#FCD34D', border: '#D97706' }, // amber for "Sugeridos"
            "Otros": { bg: '#475569', text: '#E2E8F0', iconFill: '#94A3B8', border: '#334155' }, // slate
            "Default": { bg: '#374151', text: '#D1D5DB', iconFill: '#9CA3AF', border: '#1F2937' } // gray
        };

        function getCategoryColors(categoryName) {
            return categoryColorStyles[categoryName] || categoryColorStyles["Default"];
        }


        // --- ICONOS ---
        // (Revisados y actualizados en la sección Resumen y Definición)
        const icons = {
            default: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.5 13.5h-1.5V12h1.5v1.5zm-6.75 6h1.5V18h-1.5v1.5z" /></svg>`,
            automatizacion: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>`,
            generativa: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.5 13.5h-1.5V12h1.5v1.5zm-6.75 6h1.5V18h-1.5v1.5z" /></svg>`,
            predictiva: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M16.5 3.75h.008v.008H16.5V3.75z" /></svg>`,
            optimizacion: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>`,
            clientes: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`,
            datos: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>`,
            innovacion: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.054 15.054 0 01-4.5 0m3.75-2.354v-1.012A12.037 12.037 0 0112 15c-2.17 0-4.207.56-5.998 1.584m11.996 0A12.037 12.037 0 0012 15c-2.17 0-4.207.56-5.998 1.584m11.996 0v1.012A15.054 15.054 0 0012 21.75c-2.676 0-5.216-.584-7.499-1.632M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            finance: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 12.75h5.25m0 0H21m-2.25 0S18 18.75 16.5 18.75v-1.5c0-.966-.784-1.75-1.75-1.75H11.25V18.75m0 0H6.75m0 0H3.75m0 0S6 18.75 7.5 18.75v-1.5c0-.966.784-1.75 1.75-1.75h2.75V18.75m0 0h2.25M12 15V9m0 0H9m3 0h3m-3 0V6m0 0H9m3 0h3m0 0V3m0 0H9m3 0h3" /></svg>`,
            hr: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            operations: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.39 1.024 0 1.414l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.142.854.108 1.204l.527.738c.39.39.39 1.024 0 1.414l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 010-1.414l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            reporting: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>`,
            fraud: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>`,
            supply: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>`,
            pricing: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            campaign: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21L15.803 15.803" /></svg>`,
            retention: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            all_cases: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`
        };

        function getIconForObjetivo(objetivoName) {
            const name = objetivoName.toLowerCase();
            if (name.includes("finanzas") || name.includes("contabilidad")) return icons.finance;
            if (name.includes("recursos humanos") || name.includes("rrhh") || name.includes("talento")) return icons.hr;
            if (name.includes("cliente") || name.includes("cx")) return icons.clientes;
            if (name.includes("operaciones") || name.includes("cadena de suministro") || name.includes("logística")) return icons.operations;
            if (name.includes("ventas") || name.includes("marketing")) return icons.campaign;
            if (name.includes("analítica") || name.includes("datos") || name.includes("bi")) return icons.datos;
            if (name.includes("eficiencia") || name.includes("productividad") || name.includes("automatización")) return icons.automatizacion;
            if (name.includes("ingresos") || name.includes("crecimiento") || name.includes("optimización")) return icons.optimizacion;
            if (name.includes("innovación")) return icons.innovacion;
            if (name.includes("sugeridos")) return icons.generativa; // Icon for "Sugeridos"
            return icons.default;
        }

        function getIconForSubcategory(subcategoryName) {
            const name = subcategoryName.toLowerCase();
            if (name.includes("todos los casos")) return icons.all_cases;
            if (name.includes("cuentas a cobrar") || name.includes("cuentas a pagar") || name.includes("facturación")) return icons.finance;
            if (name.includes("fraude") || name.includes("cumplimiento")) return icons.fraud;
            if (name.includes("informes") || name.includes("reporting")) return icons.reporting;
            if (name.includes("atracción de talento") || name.includes("reclutamiento")) return icons.hr;
            if (name.includes("soporte") || name.includes("atención al cliente")) return icons.clientes;
            if (name.includes("abastecimiento") || name.includes("stock") || name.includes("inventario")) return icons.supply;
            if (name.includes("precios")) return icons.pricing;
            if (name.includes("campañas")) return icons.campaign;
            if (name.includes("retención") || name.includes("churn")) return icons.retention;
            if (name.includes("integración de datos")) return icons.datos;
            if (name.includes("monitoreo de kpis") || name.includes("dashboard")) return icons.predictiva;
            if (name.includes("automatización") || name.includes("rpa")) return icons.automatizacion;
            if (name.includes("generativa") || name.includes("contenido")) return icons.generativa;
            if (name.includes("predictiva") || name.includes("análisis") || name.includes("modelos")) return icons.predictiva;
            if (name.includes("optimización") || name.includes("eficiencia")) return icons.optimizacion;
            if (name.includes("sugeridos")) return icons.generativa; // Icon for "Sugeridos" subcategory
            return icons.default;
        }

        function showGeneralMessage(message, type = 'error') {
            const msgDiv = document.getElementById('generalUserMessage');
            const msgText = document.getElementById('generalUserMessageText');
            msgText.textContent = message;

            msgDiv.classList.remove('hidden', 'bg-green-500', 'bg-red-500', 'bg-blue-500');
            if (type === 'success') {
                msgDiv.classList.add('bg-green-500');
            } else if (type === 'info') {
                msgDiv.classList.add('bg-blue-500');
            } else {
                msgDiv.classList.add('bg-red-500');
            }

            setTimeout(() => {
                msgDiv.classList.add('hidden');
            }, 7000);
        }


        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('mainNav').classList.add('hidden');
            navigateTo('sectionLogin');

            const loginForm = document.getElementById('loginForm');
            loginForm.addEventListener('submit', handleLogin);

            const fileInput = document.getElementById('currentProcessFiles');
            const fileListDisplay = document.getElementById('fileListDisplay');
            fileInput.addEventListener('change', (event) => {
                selectedPilot.attachedFileNames = [];
                fileListDisplay.innerHTML = '';
                if (event.target.files.length > 0) {
                    const ul = document.createElement('ul');
                    ul.classList.add('list-disc', 'list-inside', 'pl-2');
                    for (const file of event.target.files) {
                        selectedPilot.attachedFileNames.push(file.name);
                        const li = document.createElement('li');
                        li.textContent = file.name;
                        ul.appendChild(li);
                    }
                    fileListDisplay.appendChild(ul);
                } else {
                    fileListDisplay.textContent = 'Ningún archivo seleccionado.';
                }
            });
            const saveBtn = document.getElementById('saveSummaryButton');
            if (saveBtn) {
                saveBtn.addEventListener('click', saveSummary);
            }
        });

        const navButtons = document.querySelectorAll('.nav-button');
        const pageSections = document.querySelectorAll('.page-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSectionId = button.id.replace('nav', 'section');
                navigateTo(targetSectionId, button);
            });
        });

        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }


        async function handleLogin(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorMessageDiv = document.getElementById('loginErrorMessage');
            const loadingIndicator = document.getElementById('loadingIndicator');
            errorMessageDiv.classList.add('hidden');
            loadingIndicator.classList.remove('hidden');

            const username = usernameInput.value;
            const password = passwordInput.value;

            if (!csrfToken) {
                csrfToken = getCookie('csrftoken');
            }

            console.log("Login attempt with (simulated):", username);
            if (username) {
                try {
                    const response = await fetch('/api/login/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(csrfToken && { 'X-CSRFToken': csrfToken })
                        },
                        body: JSON.stringify({ username, password }),
                        credentials: 'include'
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        console.log("Login exitoso desde backend");
                        document.getElementById('appSubtitle').textContent = "Panel de Administración de Pilotos IA";
                        await fetchClientsAndDisplay();
                    } else {
                        errorMessageDiv.textContent = data.message || "Error de login desconocido.";
                        errorMessageDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error("Error en la petición de login:", error);
                    errorMessageDiv.textContent = "Error de conexión al intentar iniciar sesión.";
                    errorMessageDiv.classList.remove('hidden');
                }
            } else {
                errorMessageDiv.textContent = "Usuario o contraseña incorrectos (simulado).";
                errorMessageDiv.classList.remove('hidden');
            }
            loadingIndicator.classList.add("hidden");
        }

        async function fetchClientsAndDisplay() {
            try {
                const response = await fetch('/api/clients/');
                if (!response.ok) throw new Error(`Error fetching clients: ${response.statusText} (${response.status})`);
                const clients = await response.json();
                displayClientList(clients);
                navigateTo('sectionClientSelection');
            } catch (error) {
                console.error("Error fetching client list:", error);
                showGeneralMessage("No se pudo cargar la lista de clientes desde el servidor. Usando datos de demostración si están disponibles en el fallback.",'error');
                console.warn("API de clientes no disponible, usando datos de demostración.");
                const demoClients = [{ id: "demo_client_1", name: "Empresa Demo Alfa" }, { id: "demo_client_2", name: "Consultoría Beta" }];
                displayClientList(demoClients);
                navigateTo('sectionClientSelection');
            }
        }

        function displayClientList(clients) {
            const clientListContainer = document.getElementById('clientListContainer');
            clientListContainer.innerHTML = '';

            if (clients && clients.length > 0) {
                clients.forEach(client => {
                    const clientCard = document.createElement('div');
                    clientCard.classList.add('client-selection-card');
                    clientCard.innerHTML = `<h5>${client.name}</h5>`;
                    clientCard.onclick = () => handleClientSelection(client.id, client.name);
                    clientListContainer.appendChild(clientCard);
                });
            } else {
                clientListContainer.innerHTML = '<p class="text-gray-400 text-center">No hay clientes disponibles.</p>';
            }
        }

        async function handleClientSelection(clientId, clientName) {
            console.log("Cliente seleccionado:", clientId, clientName);
            document.getElementById('appSubtitle').textContent = `Cargando datos para ${clientName}...`;
            currentSelectedClientId = clientId;

            try {
                // 1. Carga diagnóstico y catálogo
                const diagnosticoResponse = await fetch(`/api/client/${clientId}/diagnostico/`);
                if (!diagnosticoResponse.ok) throw new Error(`Error fetching diagnostico: ${diagnosticoResponse.statusText} (${diagnosticoResponse.status})`);
                const diagnosticoData = await diagnosticoResponse.json();
                clientData = diagnosticoData;

                const catalogResponse = await fetch('/api/proyectos/catalog/');
                if (!catalogResponse.ok) throw new Error(`Error fetching catalog: ${catalogResponse.statusText} (${catalogResponse.status})`);
                const projectCatalogData = await catalogResponse.json();
                catalogData = projectCatalogData;

                // 2. Carga el resumen explícitamente desde la API
                let resumen_json = null;
                try {
                    const resumenResponse = await fetch(`/api/client/${clientId}/resume/`);
                    if (resumenResponse.ok) {
                        resumen_json = await resumenResponse.json();
                    }
                } catch (e) {
                    console.warn("No se pudo cargar el resumen del cliente:", e);
                }

                document.getElementById('summaryCompanyName_footer').textContent = clientName;
                document.getElementById('appSubtitle').textContent = `Panel de Pilotos IA para: ${clientName}`;

                if (resumen_json && Object.keys(resumen_json).length > 0) {
                    applySavedSummaryData(resumen_json);
                    console.log(resumen_json);
                } else {
                    selectedPilot = {
                        name: "", description: "", technology: "", valueProposition: "", salesPitch: "", kpis: [], monthlyROI: [],
                        currentProcessDescription: "", attachedFileNames: [], archivos_adjuntos: [],
                        selectedProcessNameContent: "", selectedProcessDescriptionContent: "", selectedProcessTechnologyContent: [],
                        originalProjectData: null, originalCategoryName: null, originalSubcategoryName: null
                    };
                }

                loadSelectedClientDataAndProceed(clientName);

            } catch (error) {
                console.error("Error fetching client/catalog data from API:", error);
                showGeneralMessage(`Error al cargar datos desde el servidor: ${error.message}. Se usarán datos de demostración si es posible.`,'error');

                clientData = {
                    empresa_contexto: "Empresa Demo Alfa es líder en su sector, buscando optimizar procesos clave mediante IA.",
                    resumen_ejecutivo: "El diagnóstico identificó oportunidades en finanzas y atención al cliente.",
                    scoring_global_actual: 65, scoring_objetivo_12m: 80,
                    transformacion_digital: { scoring: 70, categorias: [{ nombre: "Cultura Digital", valor: 75 }, { nombre: "Herramientas", valor: 60 }] },
                    procesos: { scoring: 60, categorias: [{ nombre: "Finanzas", valor: 50 }, { nombre: "Ventas", valor: 70 }] },
                    colaboracion_propuesta: ["Automatización de Cuentas a Cobrar", "Asistente de Atención al Cliente con IA"],
                    resumen_json: null
                };

                fetch('/static/proyectos.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Respuesta de red no fue OK para el catálogo de fallback (/static/proyectos.json): ${response.statusText} (${response.status})`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        catalogData = data;
                        document.getElementById('summaryCompanyName_footer').textContent = clientName;
                        document.getElementById('appSubtitle').textContent = `Panel de Pilotos IA para: ${clientName} (Datos de Demo)`;
                        loadSelectedClientDataAndProceed(clientName);
                    })
                    .catch(fallbackError => {
                        console.error("Error cargando /static/proyectos.json como fallback:", fallbackError);
                        showGeneralMessage("Error crítico: No se pudieron cargar los datos del catálogo de proyectos (ni desde API ni desde fallback /static/proyectos.json). La aplicación no puede continuar sin estos datos.",'error');
                    });
            }
        }

        /* ✅ FLAG nuevo para evitar recursión */
        let isGeneratingSummary = false;

        function applySavedSummaryData(savedSummaryRaw) {
            if (!savedSummaryRaw) return;

            let savedSummary = savedSummaryRaw;
            if (typeof savedSummaryRaw === "string") {
                try {
                    savedSummary = JSON.parse(savedSummaryRaw);
                } catch (err) {
                    console.error("[applySavedSummaryData] resumen_json malformado:", err);
                    return;
                }
            }

            // Normaliza tecnologías
            let techArray = [];
            if (savedSummary.solucion_tecnologias) {
                if (Array.isArray(savedSummary.solucion_tecnologias)) {
                    techArray = savedSummary.solucion_tecnologias.map(t => t.trim()).filter(Boolean);
                } else {
                    techArray = savedSummary.solucion_tecnologias.split(/[,;]/).map(t => t.trim()).filter(Boolean);
                }
            }

            // Oportunidades
            selectedPilot.selectedProcessNameContent = savedSummary.nombre_piloto || "";
            selectedPilot.selectedProcessDescriptionContent = savedSummary.solucion_descripcion || "";
            selectedPilot.selectedProcessTechnologyContent = [...techArray];
            selectedPilot.currentProcessDescription = savedSummary.problema_actual_descripcion || "";

            // Definición Piloto
            selectedPilot.name = savedSummary.nombre_piloto || "";
            selectedPilot.description = savedSummary.solucion_descripcion || "";
            selectedPilot.technology = techArray.join(", ");
            selectedPilot.valueProposition = savedSummary.propuesta_valor || "";
            selectedPilot.salesPitch = savedSummary.pitch_ventas || "";

            // KPIs
            selectedPilot.kpis = Array.isArray(savedSummary.kpis)
                ? savedSummary.kpis.map((k, i) => ({
                    id: `kpi-${i}`,
                    name: k.nombre || "",
                    currentValue: k.valor_actual || "",
                    targetValue: k.valor_objetivo || "",
                    impactValue: k.impacto_esperado || ""
                }))
                : [];

            // ROI
            selectedPilot.monthlyROI = Array.isArray(savedSummary.roi_indicativo)
                ? savedSummary.roi_indicativo.map((r, i) => ({
                    id: `roi-${i}`,
                    name: r.nombre || "",
                    value: r.valor || ""
                }))
                : [];

            // Archivos adjuntos
            selectedPilot.archivos_adjuntos = Array.isArray(savedSummary.archivos_adjuntos)
                ? savedSummary.archivos_adjuntos.map(f => ({
                    nombre: f.nombre,
                    url: f.url
                }))
                : [];
            selectedPilot.attachedFileNames = selectedPilot.archivos_adjuntos.map(f => f.nombre);

            // Categoría y subcategoría
            selectedPilot.originalCategoryName = savedSummary.categoria_piloto || null;
            selectedPilot.originalSubcategoryName = savedSummary.subcategoria_piloto || null;


            // Al cargar un resumen, marca el proyecto correspondiente como seleccionado en el catálogo
            if (selectedPilot.name && selectedPilot.originalCategoryName && selectedPilot.originalSubcategoryName) {
                // Busca el proyecto en el catálogo
                if (catalogData && catalogData.categories) {
                    for (const category of catalogData.categories) {
                        if (category.categoryName === selectedPilot.originalCategoryName) {
                            for (const subcategory of category.subcategories) {
                                if (subcategory.subcategoryName === selectedPilot.originalSubcategoryName) {
                                    const foundProject = subcategory.projects.find(
                                        proj => proj.projectName === selectedPilot.name
                                    );
                                    if (foundProject && foundProject.id) {
                                        currentSelectedSolutionId = foundProject.id;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            console.log(selectedPilot);
        }



        function loadSelectedClientDataAndProceed(selectedCompanyName) {
            document.getElementById('mainNav').classList.remove('hidden');
            loadClientData();
            updateSectionTitles(selectedCompanyName);

            console.log(selectedPilot);
            // Oportunidades
            renderTechnologyCheckboxes();
            document.getElementById('selectedProcessName').value = selectedPilot.selectedProcessNameContent || "";
            document.getElementById('selectedProcessDescription').value = selectedPilot.selectedProcessDescriptionContent || "";
            document.getElementById('currentProcessDescription').value = selectedPilot.currentProcessDescription || "";

            // Checkboxes de tecnología (ya estarán renderizados)
            const checkboxesContainer = document.getElementById('selectedProcessTechnologyCheckboxes');
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = selectedPilot.selectedProcessTechnologyContent.includes(checkbox.value);
            });


            document.getElementById('currentProcessFiles').value = "";
            const fileDisplay = document.getElementById('fileListDisplay');
            fileDisplay.innerHTML = '';
            if (selectedPilot.archivos_adjuntos && selectedPilot.archivos_adjuntos.length > 0) {
                const ul = document.createElement('ul');
                ul.classList.add('list-disc', 'list-inside', 'pl-2');
                selectedPilot.archivos_adjuntos.forEach(file => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.textContent = file.nombre;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.classList.add('text-blue-400', 'hover:underline');
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                fileDisplay.appendChild(ul);
            } else if (selectedPilot.attachedFileNames && selectedPilot.attachedFileNames.length > 0) {
                const ul = document.createElement('ul');
                ul.classList.add('list-disc', 'list-inside', 'pl-2');
                selectedPilot.attachedFileNames.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name + " (pendiente de guardar)";
                    ul.appendChild(li);
                });
                fileDisplay.appendChild(ul);
            }

            // Definición Piloto
            // --- NUEVO BLOQUE PARA TÍTULO Y COLOR ---
            const pilotName = selectedPilot.name || selectedPilot.selectedProcessNameContent || "Definición del Piloto";
            const categoryName = selectedPilot.originalCategoryName || "Default";
            const subcategoryName = selectedPilot.originalSubcategoryName || "";
            const colors = getCategoryColors(categoryName);

            // Cambia el fondo de todo el header
            const defHeaderBg = document.getElementById('definitionHeader');
            defHeaderBg.style.backgroundColor = colors.bg;

            // Título
            const defHeader = document.getElementById('definitionPilotNameHeader');
            defHeader.textContent = pilotName;
            defHeader.style.color = colors.text;
            defHeader.style.backgroundColor = "transparent"; // El fondo lo pone el div padre

            // Categoría y subcategoría
            const catSubcat = document.getElementById('definitionPilotCategorySubcategory');
            catSubcat.textContent = categoryName + (subcategoryName ? " / " + subcategoryName : "");
            catSubcat.style.color = colors.text;
            catSubcat.style.backgroundColor = colors.border;
            catSubcat.style.padding = "0.25rem 0.75rem";
            catSubcat.style.borderRadius = "0.5rem";
            catSubcat.style.display = "inline-block";

            document.getElementById('pilotoNameInput').value = selectedPilot.name || "";
            document.getElementById('pilotDescription').value = selectedPilot.description || "";
            document.getElementById('pilotTechnology').value = selectedPilot.technology || "";
            document.getElementById('pilotValueProposition').value = selectedPilot.valueProposition || "";
            document.getElementById('pilotSalesPitch').value = selectedPilot.salesPitch || "";
            renderKpiInputs(selectedPilot.kpis);
            renderRoiInputs(selectedPilot.monthlyROI);


            // Si hay resumen, selecciona automáticamente la categoría y subcategoría
            if (selectedPilot.originalCategoryName) {
                currentFilter = generateSafeId(selectedPilot.originalCategoryName);
            }
            if (selectedPilot.originalSubcategoryName) {
                currentSubcategoryFilter = generateSafeId(selectedPilot.originalSubcategoryName);
            }


            setupMainFilters();
            updateSubcategoryFilters();
            renderProcessCatalog();
            navigateTo('sectionCliente', document.getElementById('navCliente'));
        }

        function updateSectionTitles(companyName = "") {
            const formattedCompanyName = companyName ? `- ${companyName}` : "";
            const clienteTitleSpan = document.getElementById('clienteSectionCompanyName');
            const oportunidadesTitleSpan = document.getElementById('oportunidadesSectionCompanyName');
            const definicionTitleSpan = document.getElementById('definicionSectionCompanyName');

            if (clienteTitleSpan) clienteTitleSpan.textContent = formattedCompanyName;
            if (oportunidadesTitleSpan) oportunidadesTitleSpan.textContent = formattedCompanyName;
            if (definicionTitleSpan) definicionTitleSpan.textContent = formattedCompanyName;
        }

        /* ──────────────────────────────────────────────────────────────────────
           2️⃣  NAVEGACIÓN ENTRE PÁGINAS                                        */
        function navigateTo(pageId) {
            // Si estamos navegando al Resumen, generamos vista (una sola vez)
            if (pageId === "Resumen" && !isGeneratingSummary) {
                generateSummary();
            }

            // Oculta todas las pantallas y muestra la solicitada --------------
            document.querySelectorAll("[data-page]").forEach(el => {
                el.classList.toggle("hidden", el.dataset.page !== pageId);
            });
        }


        function navigateTo(sectionId, clickedButton = null) {
            pageSections.forEach(section => {
                section.classList.add('hidden');
            });
            const targetEl = document.getElementById(sectionId);
            if (targetEl) {
                targetEl.classList.remove('hidden');
            } else {
                console.error("Sección de destino no encontrada:", sectionId);
                return;
            }

            if (sectionId !== 'sectionLogin' && sectionId !== 'sectionClientSelection') {
                document.getElementById('mainNav').classList.remove('hidden');
                navButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                let activeBtnToSet = clickedButton;
                if (!activeBtnToSet && sectionId !== 'sectionLogin' && sectionId !== 'sectionClientSelection') {
                    const correspondingNavButton = document.getElementById(sectionId.replace('section', 'nav'));
                    if (correspondingNavButton) activeBtnToSet = correspondingNavButton;
                }
                if (activeBtnToSet) activeBtnToSet.classList.add('active');
            } else {
                document.getElementById('mainNav').classList.add('hidden');
            }


            if (sectionId === 'sectionOportunidades') {
                renderTechnologyCheckboxes();
                document.getElementById('selectedProcessName').value = selectedPilot.selectedProcessNameContent || "";
                document.getElementById('selectedProcessDescription').value = selectedPilot.selectedProcessDescriptionContent || "";
                document.getElementById('currentProcessDescription').value = selectedPilot.currentProcessDescription || "";

                // Checkboxes de tecnología
                const checkboxesContainer = document.getElementById('selectedProcessTechnologyCheckboxes');
                checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = selectedPilot.selectedProcessTechnologyContent.includes(checkbox.value);
                });

                // Archivos adjuntos
                const fileDisplay = document.getElementById('fileListDisplay');
                fileDisplay.innerHTML = '';
                if (selectedPilot.archivos_adjuntos && selectedPilot.archivos_adjuntos.length > 0) {
                    const ul = document.createElement('ul');
                    ul.classList.add('list-disc', 'list-inside', 'pl-2');
                    selectedPilot.archivos_adjuntos.forEach(file => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = file.url;
                        a.textContent = file.nombre;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.classList.add('text-blue-400', 'hover:underline');
                        li.appendChild(a);
                        ul.appendChild(li);
                    });
                    fileDisplay.appendChild(ul);
                }
            }

            if (sectionId === 'sectionDefinicion') {
                // --- NUEVO BLOQUE PARA TÍTULO Y COLOR ---
                const pilotName = selectedPilot.name || selectedPilot.selectedProcessNameContent || "Definición del Piloto";
                const categoryName = selectedPilot.originalCategoryName || "Default";
                const subcategoryName = selectedPilot.originalSubcategoryName || "";
                const colors = getCategoryColors(categoryName);

                // Cambia el fondo de todo el header
                const defHeaderBg = document.getElementById('definitionHeader');
                defHeaderBg.style.backgroundColor = colors.bg;

                // Título
                const defHeader = document.getElementById('definitionPilotNameHeader');
                defHeader.textContent = pilotName;
                defHeader.style.color = colors.text;
                defHeader.style.backgroundColor = "transparent"; // El fondo lo pone el div padre

                // Categoría y subcategoría
                const catSubcat = document.getElementById('definitionPilotCategorySubcategory');
                catSubcat.textContent = categoryName + (subcategoryName ? " / " + subcategoryName : "");
                catSubcat.style.color = colors.text;
                catSubcat.style.backgroundColor = colors.border;
                catSubcat.style.padding = "0.25rem 0.75rem";
                catSubcat.style.borderRadius = "0.5rem";
                catSubcat.style.display = "inline-block";
                // ----------------------------------------

                document.getElementById('pilotoNameInput').value = selectedPilot.name || "";
                document.getElementById('pilotDescription').value = selectedPilot.description || "";
                document.getElementById('pilotTechnology').value = selectedPilot.technology || "";
                document.getElementById('pilotValueProposition').value = selectedPilot.valueProposition || "";
                document.getElementById('pilotSalesPitch').value = selectedPilot.salesPitch || "";
                renderKpiInputs(selectedPilot.kpis);
                renderRoiInputs(selectedPilot.monthlyROI);
            }

            if (sectionId === 'sectionResumen') {
                generateSummary();
            }

            window.scrollTo(0, 0);
        }

        function navigateToSectionWithPrefill(sectionId) {
            selectedPilot.selectedProcessNameContent = document.getElementById('selectedProcessName').value;
            selectedPilot.selectedProcessDescriptionContent = document.getElementById('selectedProcessDescription').value;

            const checkboxesContainer = document.getElementById('selectedProcessTechnologyCheckboxes');
            const selectedTechs = [];
            checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                selectedTechs.push(checkbox.value);
            });
            selectedPilot.selectedProcessTechnologyContent = selectedTechs;

            selectedPilot.currentProcessDescription = document.getElementById('currentProcessDescription').value;

            // Update selectedPilot.name based on the input in Oportunidades,
            // this ensures that if user types a new name, it's used.
            // If the input is empty, it will fall back to originalProjectData.projectName if available.
            if (selectedPilot.selectedProcessNameContent) {
                selectedPilot.name = selectedPilot.selectedProcessNameContent;
            } else if (selectedPilot.originalProjectData && selectedPilot.originalProjectData.projectName) {
                selectedPilot.name = selectedPilot.originalProjectData.projectName;
            } else {
                selectedPilot.name = ""; // Clear if no input and no catalog item
            }

            // If a catalog item was selected, and the user clears the name field,
            // we should probably also clear the originalProjectData link to avoid prefilling from it.
            if (!selectedPilot.selectedProcessNameContent && currentSelectedSolutionId) {
                // This implies the user wants a new custom pilot, not based on the last selected catalog item.
                // However, originalCategoryName might still be relevant from the filter context.
                // For now, let's keep originalProjectData if a catalog item was selected,
                // and the prefill logic in navigateTo('sectionDefinicion') will handle it.
            }


            navigateTo(sectionId, document.getElementById(sectionId.replace('section', 'nav')));
        }

        const defaultChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, max: 100, ticks: { color: '#9EA3A2', font: { size: 10 } }, grid: { color: 'rgba(158, 163, 162, 0.2)' } },
                y: { ticks: { color: '#9EA3A2', autoSkip: false, font: { size: 10 } }, grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    titleColor: '#F0CE09', bodyColor: '#FFFFFF', backgroundColor: 'rgba(0, 4, 23, 0.9)',
                    borderColor: '#4C8EFA', borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += context.parsed.x;
                            }
                            return label;
                        }
                    }
                }
            }
        };

        const fofiPalette = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1'];


        function loadClientData() {
            if (!clientData || Object.keys(clientData).length === 0) {
                document.getElementById('clienteContexto').textContent = "Seleccione un cliente para ver su información.";
                document.getElementById('clienteResumen').textContent = "";
                return;
            }
            document.getElementById('clienteContexto').textContent = clientData.empresa_contexto || "N/A";
            document.getElementById('clienteResumen').textContent = clientData.resumen_ejecutivo || "N/A";
            document.getElementById('scoringActualText').textContent = clientData.scoring_global_actual || "N/A";
            document.getElementById('scoringObjetivoText').textContent = clientData.scoring_objetivo_12m || "N/A";

            if (clientData.transformacion_digital) {
                document.getElementById('transformacionScoringText').textContent = clientData.transformacion_digital.scoring || "N/A";
                createHorizontalBarChart('transformacionChart', clientData.transformacion_digital.categorias, 'Valoración Transformación');
            }

            if (clientData.procesos) {
                document.getElementById('procesosScoringText').textContent = clientData.procesos.scoring || "N/A";
                createHorizontalBarChart('procesosChart', clientData.procesos.categorias, 'Valoración Procesos');
            }

            const colaboracionList = document.getElementById('colaboracionPropuesta');
            colaboracionList.innerHTML = '';
            if (clientData.colaboracion_propuesta && clientData.colaboracion_propuesta.length > 0) {
                clientData.colaboracion_propuesta.forEach(prop => {
                    const li = document.createElement('li');
                    li.textContent = prop;
                    colaboracionList.appendChild(li);
                });
            } else {
                colaboracionList.innerHTML = '<li>No hay propuestas específicas para este cliente.</li>';
            }
            createScoringGlobalChart();
        }
        function createScoringGlobalChart() {
            const ctx = document.getElementById('scoringGlobalChart').getContext('2d');
            if (scoringGlobalChartInstance) scoringGlobalChartInstance.destroy();
            scoringGlobalChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['Scoring Global'], datasets: [{ label: 'Actual', data: [clientData.scoring_global_actual || 0], backgroundColor: '#658A80', borderColor: '#52756D', borderWidth: 1 }, { label: 'Objetivo 12m', data: [clientData.scoring_objetivo_12m || 0], backgroundColor: '#4C8EFA', borderColor: '#3C72D8', borderWidth: 1 }] }, options: { ...defaultChartOptions, indexAxis: 'y', scales: { x: { ...defaultChartOptions.scales.x, stacked: false }, y: { ...defaultChartOptions.scales.y, stacked: false, display: false } }, plugins: { ...defaultChartOptions.plugins, legend: { ...defaultChartOptions.plugins.legend, position: 'bottom' } } } });
        }

        function createHorizontalBarChart(canvasId, chartData, labelPrefix = 'Valoración') {
            const container = document.getElementById(canvasId + 'Container');
            if (!container) return;

            const oldCanvas = document.getElementById(canvasId);
            if (oldCanvas) oldCanvas.remove();

            const newCanvas = document.createElement('canvas');
            newCanvas.id = canvasId;
            container.appendChild(newCanvas);

            const ctx = newCanvas.getContext('2d');

            const labels = chartData.map(cat => cat.nombre);
            const dataValues = chartData.map(cat => cat.valor);
            const backgroundColors = chartData.map((_, index) => fofiPalette[index % fofiPalette.length]);

            const chartHeight = chartData.length * 30 + 60;
            container.style.height = `${chartHeight}px`;


            if (canvasId === 'transformacionChart' && transformacionChartInstance) transformacionChartInstance.destroy();
            if (canvasId === 'procesosChart' && procesosChartInstance) procesosChartInstance.destroy();

            const chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: labelPrefix,
                        data: dataValues,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors.map(color => chroma(color).darken(0.5).hex()),
                        borderWidth: 1,
                        barThickness: 10,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { color: '#9EA3A2', font: { size: 10 } },
                            grid: { color: 'rgba(158, 163, 162, 0.1)' }
                        },
                        y: {
                            ticks: { color: '#E0E0E0', font: { size: 11 }, align: 'start' },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            titleColor: '#F0CE09', bodyColor: '#FFFFFF', backgroundColor: 'rgba(0, 4, 23, 0.9)',
                            borderColor: '#4C8EFA', borderWidth: 1,
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: ${context.parsed.x}`;
                                }
                            }
                        },
                    }
                }
            });

            if (canvasId === 'transformacionChart') transformacionChartInstance = chartInstance;
            if (canvasId === 'procesosChart') procesosChartInstance = chartInstance;
        }


        function generateSafeId(str) {
            if (typeof str !== 'string') return `invalid_id_${Math.random().toString(36).substring(2, 9)}`;
            return str.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        }
        function setupMainFilters() {
            const quickFiltersContainer = document.getElementById('quickMainFiltersContainer');
            const objetivoCardsContainer = document.getElementById('objetivoCardsContainer');
            quickFiltersContainer.innerHTML = '';
            objetivoCardsContainer.innerHTML = '';

            const allButton = document.createElement('button');
            allButton.classList.add('main-filter-button'); // Active class set by setActiveStep1Filter
            allButton.innerHTML = `${icons.all_cases}Todos los Objetivos`;
            allButton.onclick = () => {
                currentFilter = "All";
                currentSubcategoryFilter = "AllSubcategories";
                setActiveStep1Filter(allButton);
                updateSubcategoryFilters();
                renderProcessCatalog();
            };
            quickFiltersContainer.appendChild(allButton);

            const suggestedButton = document.createElement('button');
            suggestedButton.classList.add('main-filter-button');
            suggestedButton.innerHTML = `${icons.generativa}Sugeridos`; // Changed text
            suggestedButton.onclick = () => {
                currentFilter = "Suggested";
                currentSubcategoryFilter = "AllSubcategories"; // Reset subcategory for "Sugeridos"
                setActiveStep1Filter(suggestedButton);
                updateSubcategoryFilters(); // This will hide subcategory section for "Sugeridos"
                renderProcessCatalog();
            };
            quickFiltersContainer.appendChild(suggestedButton);

            if (catalogData && catalogData.categories) {
                catalogData.categories.forEach(category => {
                    const card = document.createElement('div');
                    card.classList.add('objetivo-filter-card');
                    const colors = getCategoryColors(category.categoryName);
                    card.style.backgroundColor = colors.bg;
                    card.style.borderColor = colors.border;
                    card.innerHTML = `${getIconForObjetivo(category.categoryName)}<span style="color: ${colors.text};">${category.categoryName}</span>`;
                    card.querySelector('svg').style.fill = colors.iconFill;

                    card.dataset.categoryId = generateSafeId(category.categoryName);
                    card.onclick = () => {
                        currentFilter = card.dataset.categoryId;
                        currentSubcategoryFilter = "AllSubcategories";
                        setActiveStep1Filter(card);
                        updateSubcategoryFilters();
                        renderProcessCatalog();
                    };
                    objetivoCardsContainer.appendChild(card);
                });
            }
            // Set initial active filter (e.g., "All" or based on loaded summary)
            let initialActiveFilterElement = document.querySelector(`#objetivoCardsContainer .objetivo-filter-card[data-category-id="${currentFilter}"]`);
            if (!initialActiveFilterElement) { // If specific category from summary not found or currentFilter is "All"/"Suggested"
                if (currentFilter === "Suggested") {
                    initialActiveFilterElement = suggestedButton;
                } else {
                    initialActiveFilterElement = allButton; // Default to "All"
                    currentFilter = "All"; // Ensure currentFilter state matches
                }
            }

            // Si hay resumen cargado, marca la categoría y subcategoría
            if (selectedPilot.originalCategoryName) {
                currentFilter = generateSafeId(selectedPilot.originalCategoryName);
            }


            setActiveStep1Filter(initialActiveFilterElement);
        }
        function setActiveStep1Filter(activeElement) {
            document.querySelectorAll('#quickMainFiltersContainer .main-filter-button, #objetivoCardsContainer .objetivo-filter-card').forEach(el => {
                el.classList.remove('active');
                // Reset to default/category-specific style
                if (el.classList.contains('objetivo-filter-card')) {
                    const catName = catalogData.categories.find(c => generateSafeId(c.categoryName) === el.dataset.categoryId)?.categoryName || "Default";
                    const colors = getCategoryColors(catName);
                    el.style.backgroundColor = colors.bg;
                    el.style.borderColor = colors.border;
                    el.querySelector('span').style.color = colors.text;
                    el.querySelector('svg').style.fill = colors.iconFill;
                } else { // For "All" and "Sugeridos" buttons
                    el.style.backgroundColor = 'rgba(76, 142, 250, 0.3)';
                    el.style.borderColor = '#4C8EFA';
                    el.style.color = 'white';
                }
            });
            activeElement.classList.add('active');
            // Apply active styles (could be category specific or a general active style)
            if (activeElement.classList.contains('objetivo-filter-card')) {
                const catName = catalogData.categories.find(c => generateSafeId(c.categoryName) === activeElement.dataset.categoryId)?.categoryName || "Default";
                const colors = getCategoryColors(catName);
                activeElement.style.backgroundColor = chroma(colors.bg).darken(0.5).hex(); // Darken for active state
                activeElement.style.borderColor = colors.iconFill; // Use iconFill for active border
                activeElement.querySelector('span').style.color = colors.text; // Keep text color
            } else { // For "All" and "Sugeridos" buttons
                activeElement.style.backgroundColor = '#4C8EFA'; // Tailwind blue-500
                activeElement.style.borderColor = '#6CA0FC';
                activeElement.style.color = 'white';
            }
        }
        function updateSubcategoryFilters() {
            const cardContainer = document.getElementById('subcategoryFilterCardContainer');
            const sectionContainer = document.getElementById('subcategoryFilterSection');
            cardContainer.innerHTML = '';

            if (currentFilter === "All" || currentFilter === "Suggested" || !catalogData || !catalogData.categories) {
                sectionContainer.classList.add('hidden');
                return;
            }
            sectionContainer.classList.remove('hidden');

            const selectedCategory = catalogData.categories.find(cat => generateSafeId(cat.categoryName) === currentFilter);
            const categoryColors = getCategoryColors(selectedCategory ? selectedCategory.categoryName : "Default");

            // Style the H4 title of the subcategory section
            const subcategorySectionTitle = sectionContainer.querySelector('h4');
            if (subcategorySectionTitle) subcategorySectionTitle.style.color = categoryColors.iconFill;


            if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
                const allCard = document.createElement('div');
                allCard.classList.add('subcategory-filter-card');
                allCard.dataset.subcategoryId = "AllSubcategories";
                allCard.innerHTML = `${getIconForSubcategory("Todos los Casos de Uso")}<span>Todos los Casos de Uso</span>`;
                allCard.style.backgroundColor = `rgba(${parseInt(categoryColors.bg.slice(1, 3), 16)}, ${parseInt(categoryColors.bg.slice(3, 5), 16)}, ${parseInt(categoryColors.bg.slice(5, 7), 16)}, 0.15)`;
                allCard.style.borderColor = categoryColors.border;
                allCard.querySelector('svg').style.fill = categoryColors.iconFill;
                allCard.querySelector('span').style.color = categoryColors.text;

                allCard.onclick = () => {
                    currentSubcategoryFilter = "AllSubcategories";
                    setActiveSubcategoryCard(allCard);
                    renderProcessCatalog();
                };
                cardContainer.appendChild(allCard);

                selectedCategory.subcategories.forEach(sub => {
                    const subId = generateSafeId(sub.subcategoryName);
                    const card = document.createElement('div');
                    card.classList.add('subcategory-filter-card');
                    card.dataset.subcategoryId = subId;
                    card.innerHTML = `${getIconForSubcategory(sub.subcategoryName)}<span>${sub.subcategoryName}</span>`;
                    card.style.backgroundColor = `rgba(${parseInt(categoryColors.bg.slice(1, 3), 16)}, ${parseInt(categoryColors.bg.slice(3, 5), 16)}, ${parseInt(categoryColors.bg.slice(5, 7), 16)}, 0.15)`;
                    card.style.borderColor = categoryColors.border;
                    card.querySelector('svg').style.fill = categoryColors.iconFill;
                    card.querySelector('span').style.color = categoryColors.text;
                    card.onclick = () => {
                        currentSubcategoryFilter = subId;
                        setActiveSubcategoryCard(card);
                        renderProcessCatalog();
                    };
                    cardContainer.appendChild(card);
                });

                if (selectedPilot.originalSubcategoryName) {
                    currentSubcategoryFilter = generateSafeId(selectedPilot.originalSubcategoryName);
                }


                const activeCardToSet = cardContainer.querySelector(`.subcategory-filter-card[data-subcategory-id="${currentSubcategoryFilter}"]`) || cardContainer.querySelector('[data-subcategory-id="AllSubcategories"]');
                if (activeCardToSet) setActiveSubcategoryCard(activeCardToSet);

            } else {
                const noSubcategoriesMsg = document.createElement('p');
                noSubcategoriesMsg.textContent = "No hay casos de uso específicos para este objetivo.";
                noSubcategoriesMsg.classList.add('text-sm', 'text-gray-500', 'italic', 'py-2', 'text-center', 'w-full');
                cardContainer.appendChild(noSubcategoriesMsg);
            }
        }
        function setActiveSubcategoryCard(activeCardElement) {
            const parentCategoryName = catalogData.categories.find(cat => generateSafeId(cat.categoryName) === currentFilter)?.categoryName || "Default";
            const categoryColors = getCategoryColors(parentCategoryName);

            document.querySelectorAll('.subcategory-filter-card').forEach(card => {
                card.classList.remove('active');
                card.style.backgroundColor = `rgba(${parseInt(categoryColors.bg.slice(1, 3), 16)}, ${parseInt(categoryColors.bg.slice(3, 5), 16)}, ${parseInt(categoryColors.bg.slice(5, 7), 16)}, 0.15)`;
                card.style.borderColor = categoryColors.border;
                card.querySelector('span').style.color = categoryColors.text;
                card.querySelector('svg').style.fill = categoryColors.iconFill;
            });
            if (activeCardElement) {
                activeCardElement.classList.add('active');
                activeCardElement.style.backgroundColor = categoryColors.bg; // Darker for active
                activeCardElement.style.borderColor = categoryColors.iconFill;
                activeCardElement.querySelector('span').style.color = categoryColors.text; // Ensure text remains readable
            }
        }

        
        function renderProcessCatalog() {
            const catalogContainer = document.getElementById('catalogContainer');
            catalogContainer.innerHTML = '';
            let foundAnyProjectOverall = false;

            if (!catalogData || (!catalogData.categories && currentFilter !== "Suggested") || (currentFilter === "Suggested" && (!clientData.colaboracion_propuesta || clientData.colaboracion_propuesta.length === 0))) {
                let msg = "Catálogo de proyectos no cargado o vacío.";
                if (currentFilter === "Suggested" && (!clientData.colaboracion_propuesta || clientData.colaboracion_propuesta.length === 0)) {
                    msg = "No hay proyectos sugeridos en el diagnóstico del cliente.";
                }
                catalogContainer.innerHTML = `<p class="text-center text-gray-400 py-4 md:col-span-2">${msg}</p>`;
                return;
            }

            if (currentFilter === "Suggested") {
                const suggestedColors = getCategoryColors("Sugeridos");
                const categoryHeaderEl = document.createElement('h3');
                categoryHeaderEl.classList.add('category-header');
                categoryHeaderEl.textContent = "Sugeridos";
                categoryHeaderEl.style.color = suggestedColors.text;
                categoryHeaderEl.style.borderBottomColor = suggestedColors.border;
                catalogContainer.appendChild(categoryHeaderEl);

                const subcategoryHeaderEl = document.createElement('h4');
                subcategoryHeaderEl.classList.add('subcategory-header');
                subcategoryHeaderEl.textContent = "Proyectos Sugeridos";
                subcategoryHeaderEl.style.color = suggestedColors.text;
                subcategoryHeaderEl.style.borderBottomColor = suggestedColors.border;
                catalogContainer.appendChild(subcategoryHeaderEl);

                if (clientData.colaboracion_propuesta && clientData.colaboracion_propuesta.length > 0) {
                    clientData.colaboracion_propuesta.forEach((projectName, idx) => {
                        const projectDetails = findProjectByNameAcrossAllCategories(projectName);
                        let project, categoryName, subcategoryName, projectUniqueId;

                        if (projectDetails) {
                            project = projectDetails.project;
                            categoryName = projectDetails.categoryName;
                            subcategoryName = projectDetails.subcategoryName;
                            projectUniqueId = project.id;
                        } else {
                            // Sugerido no está en catálogo: crea objeto mínimo y asigna ID único y estable
                            project = {
                                projectName: projectName,
                                description: "",
                                technology: "",
                            };
                            categoryName = "Sugeridos";
                            subcategoryName = "";
                            projectUniqueId = `suggested_${idx}`;
                        }

                        foundAnyProjectOverall = true;

                        const solutionDiv = document.createElement('div');
                        solutionDiv.classList.add('solution-card');
                        solutionDiv.dataset.solutionId = projectUniqueId;

                        // Marcar como seleccionado si corresponde
                        if (projectUniqueId === currentSelectedSolutionId ||
                            (selectedPilot.name === project.projectName &&
                                selectedPilot.originalCategoryName === categoryName &&
                                selectedPilot.originalSubcategoryName === subcategoryName)
                        ) {
                            solutionDiv.classList.add('solution-card-selected');
                            solutionDiv.style.borderColor = suggestedColors.iconFill;
                        } else {
                            solutionDiv.style.borderColor = suggestedColors.border;
                        }

                        // Título
                        const titleEl = document.createElement('h5');
                        titleEl.classList.add('font-semibold', 'text-lg', 'mb-1');
                        titleEl.textContent = project.projectName;
                        titleEl.style.color = suggestedColors.iconFill;
                        solutionDiv.appendChild(titleEl);

                        // Contexto de categoría/subcategoría
                        const contextP = document.createElement('p');
                        contextP.classList.add('text-xs', 'text-gray-400', 'mb-2', 'italic');
                        contextP.textContent = `(De: ${categoryName} / ${subcategoryName})`;
                        solutionDiv.appendChild(contextP);

                        // Descripción y tecnología
                        solutionDiv.innerHTML += `
                <p class="text-sm text-gray-300 mt-1 mb-3">${project.description || "Sin descripción."}</p>
                <p class="text-xs text-gray-400 mb-2"><strong>Tecnología:</strong> ${project.technology || 'No especificada'}</p>
            `;

                        // Botón de selección
                        const selectBtn = document.createElement('button');
                        selectBtn.className = "text-xs btn-secondary py-1 px-2 mt-auto";
                        selectBtn.style.backgroundColor = suggestedColors.bg;
                        selectBtn.style.borderColor = suggestedColors.border;
                        selectBtn.textContent = "Seleccionar para Piloto";
                        selectBtn.onclick = () => selectSolutionForPilot(projectUniqueId);
                        solutionDiv.appendChild(selectBtn);

                        catalogContainer.appendChild(solutionDiv);
                    });
                } else {
                    catalogContainer.innerHTML += `<p class="text-center text-gray-400 py-4 md:col-span-2">No hay proyectos sugeridos en el diagnóstico del cliente.</p>`;
                }
            } else { // Standard catalog browsing
                catalogData.categories.forEach(category => {
                    const mainCategoryIdSafe = generateSafeId(category.categoryName);
                    const categoryColors = getCategoryColors(category.categoryName);
                    let shouldDisplayThisMainCategory = false;

                    if (currentFilter === "All" || currentFilter === mainCategoryIdSafe) {
                        shouldDisplayThisMainCategory = true;
                    }

                    if (shouldDisplayThisMainCategory) {
                        const categoryFragment = document.createDocumentFragment();
                        let hasVisibleProjectsInThisCategory = false;

                        category.subcategories.forEach(subcategory => {
                            const subcategoryIdSafe = generateSafeId(subcategory.subcategoryName);
                            let projectsToDisplay = [...subcategory.projects];

                            if (currentSubcategoryFilter !== "AllSubcategories" && currentSubcategoryFilter !== subcategoryIdSafe) {
                                projectsToDisplay = [];
                            }

                            if (projectsToDisplay.length > 0) {
                                hasVisibleProjectsInThisCategory = true;
                                foundAnyProjectOverall = true;

                                const subcategoryHeaderEl = document.createElement('h4');
                                subcategoryHeaderEl.classList.add('subcategory-header');
                                subcategoryHeaderEl.textContent = subcategory.subcategoryName;
                                subcategoryHeaderEl.style.color = categoryColors.text;
                                subcategoryHeaderEl.style.borderBottomColor = categoryColors.border;
                                categoryFragment.appendChild(subcategoryHeaderEl);

                                projectsToDisplay.forEach((project, projectIndex) => {
                                    const projectUniqueId = `${mainCategoryIdSafe}_${subcategoryIdSafe}_${generateSafeId(project.projectName || `proj_${projectIndex}`)}_${projectIndex}`;
                                    project.id = projectUniqueId;
                                    project.originalCategoryName = category.categoryName;
                                    project.originalSubcategoryName = subcategory.subcategoryName;

                                    const solutionDiv = document.createElement('div');
                                    solutionDiv.classList.add('solution-card');
                                    solutionDiv.dataset.solutionId = project.id;
                                    solutionDiv.style.borderColor = categoryColors.border;

                                    const isSuggestedByData = clientData.colaboracion_propuesta && clientData.colaboracion_propuesta.includes(project.projectName);
                                    if (isSuggestedByData) {
                                        solutionDiv.classList.add('suggested-highlight');
                                    }
                                    if (project.id === currentSelectedSolutionId ||
                                        (selectedPilot.name === project.projectName &&
                                            selectedPilot.originalCategoryName === category.categoryName &&
                                            selectedPilot.originalSubcategoryName === subcategory.subcategoryName)
                                    ) {
                                        solutionDiv.classList.add('solution-card-selected');
                                        solutionDiv.style.borderColor = categoryColors.iconFill;
                                    }

                                    const titleEl = document.createElement('h5');
                                    titleEl.classList.add('font-semibold', 'text-lg', 'mb-1');
                                    titleEl.textContent = project.projectName || "Proyecto sin nombre";
                                    titleEl.style.color = categoryColors.iconFill;

                                    if (isSuggestedByData && currentFilter !== "Suggested") {
                                        const suggestedSpan = document.createElement('span');
                                        suggestedSpan.classList.add('text-xs', 'font-bold', 'ml-2', 'align-middle');
                                        suggestedSpan.textContent = '(SUGERIDO)';
                                        suggestedSpan.style.color = '#F0CE09';
                                        titleEl.appendChild(suggestedSpan);
                                    }

                                    solutionDiv.appendChild(titleEl);
                                    solutionDiv.innerHTML += `
                                <p class="text-sm text-gray-300 mt-1 mb-3">${project.description || "Sin descripción."}</p>
                                <p class="text-xs text-gray-400 mb-2"><strong>Tecnología:</strong> ${project.technology || 'No especificada'}</p>
                                <button class="text-xs btn-secondary py-1 px-2 mt-auto" style="background-color:${categoryColors.bg}; border-color:${categoryColors.border};" onclick="selectSolutionForPilot('${project.id}')">Seleccionar para Piloto</button>
                            `;
                                    categoryFragment.appendChild(solutionDiv);
                                });
                            }
                        });

                        if (hasVisibleProjectsInThisCategory) {
                            const categoryHeaderEl = document.createElement('h3');
                            categoryHeaderEl.classList.add('category-header');
                            categoryHeaderEl.textContent = category.categoryName;
                            categoryHeaderEl.style.color = categoryColors.text;
                            categoryHeaderEl.style.borderBottomColor = categoryColors.border;
                            catalogContainer.appendChild(categoryHeaderEl);
                            catalogContainer.appendChild(categoryFragment);
                        }
                    }
                });
            }

            if (!foundAnyProjectOverall) {
                let message = "No hay soluciones disponibles para los filtros seleccionados.";
                if (currentFilter === "Suggested" && (!clientData.colaboracion_propuesta || clientData.colaboracion_propuesta.length === 0)) {
                    message = 'No hay proyectos sugeridos en el diagnóstico del cliente.';
                }
                catalogContainer.innerHTML = `<p class="text-center text-gray-400 py-4 md:col-span-2">${message}</p>`;
            }
        }


        // Encuentra el número máximo de sufijo en los IDs de los proyectos del catálogo
        function getMaxProjectIndexFromCatalog() {
            let maxIndex = 0;
            if (catalogData && catalogData.categories) {
                catalogData.categories.forEach(category => {
                    category.subcategories.forEach(subcategory => {
                        subcategory.projects.forEach((project, idx) => {
                            if (project.id) {
                                // Busca el último número en el id (por ejemplo: ..._3)
                                const match = project.id.match(/_(\d+)$/);
                                if (match && parseInt(match[1]) > maxIndex) {
                                    maxIndex = parseInt(match[1]);
                                }
                            }
                        });
                    });
                });
            }
            return maxIndex;
        }

        function findProjectByNameAcrossAllCategories(projectName) {
            if (!catalogData || !catalogData.categories) return null;
            for (const category of catalogData.categories) {
                for (const subcategory of category.subcategories) {
                    const foundProject = subcategory.projects.find(proj => proj.projectName === projectName);
                    if (foundProject) {
                        return {
                            project: foundProject,
                            categoryName: category.categoryName,
                            subcategoryName: subcategory.subcategoryName
                        };
                    }
                }
            }
            return null;
        }

        function selectSolutionForPilot(solutionId) {
            const actualSolutionDetails = findSolutionByIdWithDetails(solutionId);

            if (!actualSolutionDetails) {
                console.error("Solución no encontrada con ID:", solutionId);
                showGeneralMessage("Error: No se pudo encontrar la solución seleccionada.",'error');
                return;
            }
            currentSelectedSolutionId = actualSolutionDetails.project.id;
            selectedPilot.originalProjectData = actualSolutionDetails.project;
            selectedPilot.originalCategoryName = actualSolutionDetails.categoryName;
            selectedPilot.originalSubcategoryName = actualSolutionDetails.subcategoryName;

            // Always update the pilot name to the selected project's name
            selectedPilot.name = actualSolutionDetails.project.projectName;
            selectedPilot.selectedProcessNameContent = actualSolutionDetails.project.projectName; // Sync with Oportunidades input

            // If no saved summary exists, or if the user is selecting a *different* project than what was in a loaded summary,
            // then prefill from the catalog.
            if (!clientData.resumen_json || (clientData.resumen_json && clientData.resumen_json.nombre_piloto !== actualSolutionDetails.project.projectName)) {
                selectedPilot.description = actualSolutionDetails.project.description || "";
                selectedPilot.technology = actualSolutionDetails.project.technology || "";
                selectedPilot.valueProposition = actualSolutionDetails.project.valueProposition || "";
                selectedPilot.salesPitch = actualSolutionDetails.project.salesPitch || "";
                selectedPilot.kpis = (actualSolutionDetails.project.kpis || []).map((kpi, index) => ({
                    id: `kpi-cat-${index}`, name: kpi.name, currentValue: "Por definir",
                    targetValue: kpi.value, impactValue: ""
                }));
                selectedPilot.monthlyROI = (actualSolutionDetails.project.monthlyROI || []).map((roi, index) => ({
                    id: `roi-cat-${index}`, name: roi.name, value: roi.value
                }));
                selectedPilot.selectedProcessTechnologyContent = actualSolutionDetails.project.technology
                    ? actualSolutionDetails.project.technology.split(/[,;]/).map(t => t.trim())
                    : [];
            }
            // If a summary was loaded AND it matches the currently selected project, selectedPilot fields are already correct from applySavedSummaryData.


            document.getElementById('selectedProcessName').value = selectedPilot.selectedProcessNameContent; // Use the (potentially updated) name
            document.getElementById('selectedProcessDescription').value = selectedPilot.description || ""; // Use description from selectedPilot

            const checkboxesContainer = document.getElementById('selectedProcessTechnologyCheckboxes');
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);

            const techToSelect = selectedPilot.selectedProcessTechnologyContent || (actualSolutionDetails.project.technology ? actualSolutionDetails.project.technology.split(/[,;]/).map(t => t.trim()) : []);

            techToSelect.forEach(techValue => {
                const checkbox = checkboxesContainer.querySelector(`input[type="checkbox"][value="${techValue}"]`);
                if (checkbox) checkbox.checked = true;
                else { // Check by label if value doesn't match exactly (for "Otros", etc.)
                    Array.from(checkboxesContainer.querySelectorAll('label')).find(label => {
                        if (label.textContent.toLowerCase().includes(techValue.toLowerCase())) {
                            label.querySelector('input[type="checkbox"]').checked = true;
                            return true;
                        }
                        return false;
                    });
                }
            });

            renderProcessCatalog();
        }

        function findSolutionByIdWithDetails(solutionId) {
            // 1. Buscar en el catálogo normal
            if (catalogData && catalogData.categories) {
                for (const category of catalogData.categories) {
                    for (const subcategory of category.subcategories) {
                        const foundProject = subcategory.projects.find(proj => proj.id === solutionId);
                        if (foundProject) {
                            return {
                                project: foundProject,
                                categoryName: category.categoryName,
                                subcategoryName: subcategory.subcategoryName
                            };
                        }
                    }
                }
            }

            // 2. Buscar en los sugeridos (IDs tipo suggested_XX)
            if (typeof solutionId === "string" && solutionId.startsWith("suggested_")) {
                const idx = parseInt(solutionId.replace("suggested_", ""), 10);
                if (
                    clientData &&
                    Array.isArray(clientData.colaboracion_propuesta) &&
                    idx >= 0 &&
                    idx < clientData.colaboracion_propuesta.length
                ) {
                    const projectName = clientData.colaboracion_propuesta[idx];
                    if (projectName) {
                        return {
                            project: {
                                id: solutionId,
                                projectName: projectName,
                                description: "",
                                technology: ""
                            },
                            categoryName: "Sugeridos",
                            subcategoryName: ""
                        };
                    }
                }
            }

            return null;
        }


        function findSolutionById(solutionId) {
            const details = findSolutionByIdWithDetails(solutionId);
            return details ? details.project : null;
        }

        function prefillPilotDefinition(solution) { // This is called when navigating to Definicion *if* a catalog item is the basis
            if (!solution) { // Should not happen if called correctly
                document.getElementById('pilotoNameInput').value = selectedPilot.name || selectedPilot.selectedProcessNameContent || "";
                document.getElementById('pilotDescription').value = selectedPilot.description || selectedPilot.selectedProcessDescriptionContent || "";
                const techValue = Array.isArray(selectedPilot.selectedProcessTechnologyContent) ? selectedPilot.selectedProcessTechnologyContent.join(', ') : selectedPilot.selectedProcessTechnologyContent;
                document.getElementById('pilotTechnology').value = selectedPilot.technology || techValue || "";
                document.getElementById('pilotValueProposition').value = selectedPilot.valueProposition || "";
                document.getElementById('pilotSalesPitch').value = selectedPilot.salesPitch || "";
                renderKpiInputs(selectedPilot.kpis);
                renderRoiInputs(selectedPilot.monthlyROI);
                return;
            }

            // Prefill from the solution object (which is originalProjectData)
            document.getElementById('pilotoNameInput').value = solution.projectName || selectedPilot.name || ""; // Prioritize selectedPilot.name if it was set by loaded summary
            document.getElementById('pilotDescription').value = selectedPilot.description || solution.description || "";

            let techToDisplay = selectedPilot.technology || "";
            if (!techToDisplay && Array.isArray(selectedPilot.selectedProcessTechnologyContent) && selectedPilot.selectedProcessTechnologyContent.length > 0) {
                techToDisplay = selectedPilot.selectedProcessTechnologyContent.join(', ');
            } else if (!techToDisplay) {
                techToDisplay = solution.technology || "";
            }
            document.getElementById('pilotTechnology').value = techToDisplay;


            document.getElementById('pilotValueProposition').value = selectedPilot.valueProposition || solution.valueProposition || `Optimizar ${solution.projectName} para [beneficio clave 1] y [beneficio clave 2].`;
            document.getElementById('pilotSalesPitch').value = selectedPilot.salesPitch || solution.salesPitch || `Con ${solution.projectName}, transformaremos [aspecto clave] logrando [resultado principal].`;

            // KPIs and ROI should be from selectedPilot if a summary was loaded, otherwise from catalog
            renderKpiInputs(selectedPilot.kpis.length > 0 ? selectedPilot.kpis : (solution.kpis || []).map((kpi, index) => ({
                id: `kpi-cat-prefill-${index}`, name: kpi.name, currentValue: "Por definir",
                targetValue: kpi.value, impactValue: ""
            })));
            renderRoiInputs(selectedPilot.monthlyROI.length > 0 ? selectedPilot.monthlyROI : (solution.monthlyROI || []).map((roi, index) => ({
                id: `roi-cat-prefill-${index}`, name: roi.name, value: roi.value
            })));
        }

        let kpiIdCounter = 0;
        function addKpiInput(kpi = null) {
            const kpiContainer = document.getElementById('kpiContainer');
            const kpiId = kpi ? (kpi.id || `kpi-dyn-${kpiIdCounter++}`) : `kpi-new-${kpiIdCounter++}`;

            const kpiDiv = document.createElement('div');
            kpiDiv.classList.add('dynamic-input-group');
            kpiDiv.dataset.kpiId = kpiId;
            kpiDiv.innerHTML = `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label for="kpiName-${kpiId}">Nombre del KPI:</label>
                                <input type="text" id="kpiName-${kpiId}" value="${kpi ? kpi.name : ''}" placeholder="Ej: Reducción Tiempo Procesamiento">
                            </div>
                            <div>
                                <label for="kpiCurrent-${kpiId}">Valor Actual (Hoy):</label>
                                <input type="text" id="kpiCurrent-${kpiId}" value="${kpi ? kpi.currentValue : 'N/A'}" placeholder="Ej: 20 min, 5%">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <div>
                                <label for="kpiTarget-${kpiId}">Valor Objetivo (Meta 90d):</label>
                                <input type="text" id="kpiTarget-${kpiId}" value="${kpi ? kpi.targetValue : ''}" placeholder="Ej: <5 min, >90%">
                            </div>
                            <div>
                                <label for="kpiImpact-${kpiId}">Impacto Esperado:</label>
                                <input type="text" id="kpiImpact-${kpiId}" value="${kpi ? kpi.impactValue : ''}" placeholder="Ej: -75%, +10 puntos">
                            </div>
                        </div>
                        <button type="button" onclick="removeKpiInput('${kpiId}')" class="remove-btn mt-2">Eliminar KPI</button>
                    `;
            kpiContainer.appendChild(kpiDiv);
        }

        function renderKpiInputs(kpisArray = null) {
            const kpiContainer = document.getElementById('kpiContainer');
            kpiContainer.innerHTML = '';
            kpiIdCounter = 0;
            if (kpisArray && kpisArray.length > 0) {
                kpisArray.forEach(kpi => addKpiInput(kpi));
            } else {
                addKpiInput();
            }
        }

        function removeKpiInput(kpiId) {
            const kpiDiv = document.querySelector(`.dynamic-input-group[data-kpi-id="${kpiId}"]`);
            if (kpiDiv) kpiDiv.remove();
        }

        let roiIdCounter = 0;
        function addRoiInput(roi = null) {
            const roiContainer = document.getElementById('roiContainer');
            const roiId = roi ? (roi.id || `roi-dyn-${roiIdCounter++}`) : `roi-new-${roiIdCounter++}`;

            const roiDiv = document.createElement('div');
            roiDiv.classList.add('dynamic-input-group');
            roiDiv.dataset.roiId = roiId;
            roiDiv.innerHTML = `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label for="roiName-${roiId}">Concepto de ROI:</label>
                                <input type="text" id="roiName-${roiId}" value="${roi ? roi.name : ''}" placeholder="Ej: Ahorro directo mano de obra">
                            </div>
                            <div>
                                <label for="roiValue-${roiId}">Valor Mensual Estimado (€):</label>
                                <input type="text" id="roiValue-${roiId}" value="${roi ? roi.value : ''}" placeholder="Ej: ≈ 5.600 €/mes">
                            </div>
                        </div>
                        <button type="button" onclick="removeRoiInput('${roiId}')" class="remove-btn mt-2">Eliminar Línea</button>
                    `;
            roiContainer.appendChild(roiDiv);
        }

        function renderRoiInputs(roiArray = null) {
            const roiContainer = document.getElementById('roiContainer');
            roiContainer.innerHTML = '';
            roiIdCounter = 0;
            if (roiArray && roiArray.length > 0) {
                roiArray.forEach(roi => addRoiInput(roi));
            } else {
                addRoiInput();
            }
        }

        function removeRoiInput(roiId) {
            const roiDiv = document.querySelector(`.dynamic-input-group[data-roi-id="${roiId}"]`);
            if (roiDiv) roiDiv.remove();
        }


        async function generateSummary() {
            if (isGeneratingSummary) return;   // Salvaguarda extra
            isGeneratingSummary = true;
            try {
                selectedPilot.name = document.getElementById('pilotoNameInput').value;
                selectedPilot.description = document.getElementById('pilotDescription').value;
                selectedPilot.technology = document.getElementById('pilotTechnology').value;
                selectedPilot.valueProposition = document.getElementById('pilotValueProposition').value;
                selectedPilot.salesPitch = document.getElementById('pilotSalesPitch').value;

                selectedPilot.kpis = [];
                document.querySelectorAll('#kpiContainer .dynamic-input-group').forEach(group => {
                    const id = group.dataset.kpiId;
                    const kpiNameInput = document.getElementById(`kpiName-${id}`);
                    if (kpiNameInput && kpiNameInput.value.trim() !== "") {
                        selectedPilot.kpis.push({
                            name: kpiNameInput.value,
                            currentValue: document.getElementById(`kpiCurrent-${id}`).value,
                            targetValue: document.getElementById(`kpiTarget-${id}`).value,
                            impactValue: document.getElementById(`kpiImpact-${id}`).value
                        });
                    }
                });

                selectedPilot.monthlyROI = [];
                document.querySelectorAll('#roiContainer .dynamic-input-group').forEach(group => {
                    const id = group.dataset.roiId;
                    const roiNameInput = document.getElementById(`roiName-${id}`);
                    if (roiNameInput && roiNameInput.value.trim() !== "") {
                        selectedPilot.monthlyROI.push({
                            name: roiNameInput.value,
                            value: document.getElementById(`roiValue-${id}`).value
                        });
                    }
                });

                let pilotCategoryName = selectedPilot.originalCategoryName || "Default";
                if (currentFilter !== "All" && currentFilter !== "Suggested" && !selectedPilot.originalCategoryName) {
                    const activeObjCard = document.querySelector('#objetivoCardsContainer .objetivo-filter-card.active span');
                    if (activeObjCard && catalogData.categories.find(cat => generateSafeId(cat.categoryName) === currentFilter)) {
                        pilotCategoryName = catalogData.categories.find(cat => generateSafeId(cat.categoryName) === currentFilter).categoryName;
                    }
                }
                const colors = getCategoryColors(pilotCategoryName);

                const summaryHeaderBg = document.getElementById('summaryHeaderBackground');
                summaryHeaderBg.style.backgroundColor = colors.bg;

                const summaryCaseNameEl = document.getElementById('summaryCaseName');
                summaryCaseNameEl.textContent = selectedPilot.name || "Nombre del Piloto no Definido";
                summaryCaseNameEl.style.color = colors.text;

                const summaryCaseCategoryEl = document.getElementById('summaryCaseCategory');
                let subCategoryForSummary = selectedPilot.originalSubcategoryName || "Subcategoría no especificada";
                if (currentSubcategoryFilter !== "AllSubcategories" && !selectedPilot.originalSubcategoryName) {
                    const activeSubCatCard = document.querySelector('#subcategoryFilterCardContainer .subcategory-filter-card.active span');
                    if (activeSubCatCard) subCategoryForSummary = activeSubCatCard.textContent;
                }
                summaryCaseCategoryEl.textContent = `${pilotCategoryName} / ${subCategoryForSummary}`;
                summaryCaseCategoryEl.style.color = colors.text;

                const summaryHeaderIconContainer = document.getElementById('summaryHeaderIconContainer');
                summaryHeaderIconContainer.innerHTML = getIconForObjetivo(pilotCategoryName);
                summaryHeaderIconContainer.querySelectorAll('svg').forEach(svg => svg.style.fill = colors.iconFill);

                const summaryCardContent = document.getElementById('summaryCardContent');
                summaryCardContent.style.borderColor = colors.border;

                const summaryProblemaTitle = document.getElementById('summaryProblemaTitle');
                summaryProblemaTitle.style.color = colors.text;
                summaryProblemaTitle.style.borderBottomColor = colors.border;
                summaryProblemaTitle.querySelector('svg').style.fill = colors.iconFill;

                const summarySolucionTitle = document.getElementById('summarySolucionTitle');
                summarySolucionTitle.style.color = colors.text;
                summarySolucionTitle.style.borderBottomColor = colors.border;
                summarySolucionTitle.querySelector('svg').style.fill = colors.iconFill;

                const summaryValorTitle = document.getElementById('summaryValorTitle');
                summaryValorTitle.style.color = colors.text;
                summaryValorTitle.style.borderBottomColor = colors.border;
                summaryValorTitle.querySelector('svg').style.fill = colors.iconFill;

                const summaryFasesTitle = document.getElementById('summaryFasesTitle');
                summaryFasesTitle.style.color = colors.text;
                summaryFasesTitle.style.borderBottomColor = colors.border;
                summaryFasesTitle.querySelector('svg').style.fill = colors.iconFill;

                const summaryKpiTitle = document.getElementById('summaryKpiTitle');
                summaryKpiTitle.style.color = colors.text;
                summaryKpiTitle.style.borderBottomColor = colors.border;
                summaryKpiTitle.querySelector('svg').style.fill = colors.iconFill;

                const summaryRoiTitle = document.getElementById('summaryRoiTitle');
                summaryRoiTitle.style.color = colors.text;
                summaryRoiTitle.style.borderBottomColor = colors.border;
                summaryRoiTitle.querySelector('svg').style.fill = colors.iconFill;

                const summaryPitchTitle = document.getElementById('summaryPitchTitle');
                summaryPitchTitle.style.color = colors.text;
                summaryPitchTitle.style.borderBottomColor = colors.border;
                summaryPitchTitle.querySelector('svg').style.fill = colors.iconFill;


                document.querySelectorAll('#sectionResumen .summary-list li').forEach(li => li.style.borderLeftColor = colors.iconFill);
                document.getElementById('summarySalesPitch_resumen').style.borderLeftColor = colors.iconFill;
                document.getElementById('summaryKpiTableContainer').style.borderColor = colors.border;
                document.querySelectorAll('#sectionResumen .summary-kpi-table th').forEach(th => {
                    th.style.backgroundColor = `rgba(${parseInt(colors.bg.slice(1, 3), 16)}, ${parseInt(colors.bg.slice(3, 5), 16)}, ${parseInt(colors.bg.slice(5, 7), 16)}, 0.2)`;
                    th.style.borderColor = colors.border;
                });
                document.querySelectorAll('#sectionResumen .summary-kpi-table td').forEach(cell => cell.style.borderColor = colors.border);


                const problemaList = document.getElementById('summaryProblemaActualList');
                problemaList.innerHTML = '';
                if (selectedPilot.currentProcessDescription) {
                    selectedPilot.currentProcessDescription.split('\n').forEach(item => {
                        if (item.trim()) {
                            const li = document.createElement('li');
                            li.textContent = item.trim();
                            problemaList.appendChild(li);
                        }
                    });
                }
                if (problemaList.children.length === 0) {
                    problemaList.innerHTML = '<li>No se ha detallado el problema actual.</li>';
                }

                renderSummaryAttachedFiles(selectedPilot.archivos_adjuntos.length > 0 ? selectedPilot.archivos_adjuntos : selectedPilot.attachedFileNames.map(name => ({ nombre: name, url: '#' })));


                document.getElementById('summaryPilotSolutionDescription_resumen').textContent = selectedPilot.description || "Descripción de la solución no detallada.";
                document.getElementById('summaryPilotTechnology_resumen').innerHTML = `<strong>Tecnologías:</strong> ${selectedPilot.technology || "No especificadas."}`;

                const solucionComponentsContainer = document.getElementById('summarySolucionComponents');
                solucionComponentsContainer.innerHTML = '';
                const techArray = selectedPilot.technology ? selectedPilot.technology.split(/[,;]+/) : [];
                if (techArray.length > 0) {
                    techArray.forEach(tech => {
                        const techItem = tech.trim();
                        if (techItem) {
                            const card = document.createElement('div');
                            card.classList.add('summary-solucion-component-card');
                            let iconSvg = icons.default;
                            if (techItem.toLowerCase().includes('ocr')) iconSvg = icons.generativa;
                            else if (techItem.toLowerCase().includes('llm')) iconSvg = icons.generativa;
                            else if (techItem.toLowerCase().includes('rpa')) iconSvg = icons.automatizacion;
                            else if (techItem.toLowerCase().includes('ia') || techItem.toLowerCase().includes('predictiva')) iconSvg = icons.predictiva;
                            else if (techItem.toLowerCase().includes('dashboard') || techItem.toLowerCase().includes('panel')) iconSvg = icons.datos;


                            card.innerHTML = `
                                        ${iconSvg}
                                        <h5>${techItem}</h5>
                                    `;
                            const svgInCard = card.querySelector('svg');
                            if (svgInCard) svgInCard.style.fill = colors.iconFill;

                            solucionComponentsContainer.appendChild(card);
                        }
                    });
                } else {
                    solucionComponentsContainer.innerHTML = '<p class="text-gray-400 md:col-span-2 text-center">Componentes de la solución no detallados.</p>';
                }

                document.getElementById('summaryPilotValueProposition_resumen').textContent = selectedPilot.valueProposition || "Propuesta de valor no definida.";

                const fasesList = document.getElementById('summaryFasesList');
                fasesList.innerHTML = '';
                const roadmapLine = document.querySelector('#summaryFasesCalendario .roadmap-line');
                if (roadmapLine) roadmapLine.style.backgroundColor = colors.iconFill;

                const predefinedPhases = [
                    { title: "Diagnóstico Exprés", description: "Mapeo de procesos y sistemas (< 2 semanas)." },
                    { title: "Piloto Funcional", description: "Desarrollo de la solución central y validación (< 4 semanas)." },
                    { title: "Medición y Ajustes", description: "Monitorización de KPIs, feedback y optimización (90 días)." }
                ];
                predefinedPhases.forEach((fase, index) => {
                    const li = document.createElement('li');
                    li.classList.add('roadmap-step');
                    li.innerHTML = `
                                <div class="roadmap-step-icon-wrapper">
                                    <div class="roadmap-step-icon" style="background-color: ${colors.iconFill}; color: ${colors.text}; border-color: ${colors.bg};"><span>${index + 1}</span></div>
                                </div>
                                <div class="roadmap-step-content">
                                    <div class="roadmap-step-title">${fase.title}</div>
                                    <div class="roadmap-step-description">${fase.description}</div>
                                </div>`;
                    fasesList.appendChild(li);
                });

                const kpiTableBody = document.getElementById('summaryKpiTableBody');
                kpiTableBody.innerHTML = '';
                if (selectedPilot.kpis.length > 0) {
                    selectedPilot.kpis.forEach(kpi => {
                        const row = kpiTableBody.insertRow();
                        row.insertCell().textContent = kpi.name || 'N/A';
                        row.insertCell().textContent = kpi.currentValue || 'N/A';
                        row.insertCell().textContent = kpi.targetValue || 'N/A';
                        const impactCell = row.insertCell();
                        impactCell.textContent = kpi.impactValue || 'N/A';
                        impactCell.classList.add('kpi-impact-positive'); // Always green
                    });
                } else {
                    kpiTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-400 py-3">No se han definido KPIs.</td></tr>';
                }

                const roiList = document.getElementById('summaryRoiList');
                roiList.innerHTML = '';
                if (selectedPilot.monthlyROI.length > 0) {
                    selectedPilot.monthlyROI.forEach(roi => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${roi.name || 'Concepto no definido'}:</strong> ${roi.value || 'Valor no definido'}`;
                        roiList.appendChild(li);
                    });
                } else {
                    roiList.innerHTML = '<li>No se ha detallado el ROI.</li>';
                }

                document.getElementById('summarySalesPitch_resumen').textContent = selectedPilot.salesPitch || "Pitch de ventas no definido.";

                navigateTo('sectionResumen', document.getElementById('navResumen'));
            } finally {
                isGeneratingSummary = false;
            }
        }

        /* --------------------------------------------------------------------
           4️⃣  Helpers y resto de lógica (sin cambios)                         */
        function generateSafeId(text) {
            return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }

        async function saveSummary() {
            const messageDiv = document.getElementById('saveSummaryMessage');
            messageDiv.textContent = 'Guardando...';
            messageDiv.style.color = '#4C8EFA';

            if (!currentSelectedClientId) {
                messageDiv.textContent = 'Error: No hay cliente seleccionado.';
                messageDiv.style.color = '#F87171';
                return;
            }

            let uploadedFilesInfo = selectedPilot.archivos_adjuntos || [];
            const fileInput = document.getElementById('currentProcessFiles');

            if (fileInput.files.length > 0) {
                const newFilesUploaded = await uploadFilesIfAny();
                if (newFilesUploaded.length > 0 || fileInput.files.length > 0) {
                    selectedPilot.archivos_adjuntos = newFilesUploaded;
                }
            }


            const resumenPayload = {
                cliente_id: currentSelectedClientId,
                nombre_piloto: selectedPilot.name,
                categoria_piloto: document.getElementById('summaryCaseCategory').textContent.split('/')[0].trim(),
                subcategoria_piloto: document.getElementById('summaryCaseCategory').textContent.split('/')[1]?.trim() || "",

                problema_actual_descripcion: selectedPilot.currentProcessDescription,

                solucion_descripcion: selectedPilot.description,
                solucion_tecnologias: selectedPilot.technology,

                propuesta_valor: selectedPilot.valueProposition,

                kpis: selectedPilot.kpis.map(kpi => ({
                    nombre: kpi.name,
                    valor_actual: kpi.currentValue,
                    valor_objetivo: kpi.targetValue,
                    impacto_esperado: kpi.impactValue
                })),
                roi_indicativo: selectedPilot.monthlyROI.map(roi => ({
                    nombre: roi.name,
                    valor: roi.value
                })),
                pitch_ventas: selectedPilot.salesPitch,
                archivos_adjuntos: selectedPilot.archivos_adjuntos
            };

            console.log("Enviando al backend:", JSON.stringify(resumenPayload, null, 2));

            try {
                const response = await fetch(`/api/client/${currentSelectedClientId}/guardar_resumen/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken && { 'X-CSRFToken': csrfToken })
                    },
                    body: JSON.stringify(resumenPayload)
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    messageDiv.textContent = 'Resumen guardado correctamente.';
                    messageDiv.style.color = '#34D399';
                    renderSummaryAttachedFiles(selectedPilot.archivos_adjuntos);
                } else {
                    messageDiv.textContent = data.message || 'Error al guardar el resumen en el backend.';
                    messageDiv.style.color = '#F87171';
                }
            } catch (error) {
                console.error("Error de conexión al guardar el resumen:", error);
                messageDiv.textContent = 'Error de conexión al guardar el resumen.';
                messageDiv.style.color = '#F87171';
            }
        }

        async function uploadFilesIfAny() {
            const fileInput = document.getElementById('currentProcessFiles');
            if (!fileInput.files || fileInput.files.length === 0) {
                return selectedPilot.archivos_adjuntos || [];
            }

            const formData = new FormData();
            for (const file of fileInput.files) {
                formData.append('files', file);
            }

            try {
                const response = await fetch(`/api/client/${currentSelectedClientId}/upload_file/`, {
                    method: 'POST',
                    headers: {
                        ...(csrfToken && { 'X-CSRFToken': csrfToken })
                    },
                    body: formData
                });
                const data = await response.json();
                if (response.ok && data.success && data.files) {
                    console.log("Archivos subidos:", data.files);
                    fileInput.value = "";
                    document.getElementById('fileListDisplay').innerHTML = '<span class="text-green-400">Archivos subidos y listos para guardar con el resumen.</span>';
                    return data.files;
                } else {
                    console.error("Error en la subida de archivos desde el backend:", data.message);
                    document.getElementById('fileListDisplay').innerHTML = `<span class="text-red-400">Error al subir archivos: ${data.message || 'Desconocido'}. No se adjuntarán al resumen.</span>`;
                    return selectedPilot.archivos_adjuntos || [];
                }
            } catch (error) {
                console.error("Error de red al subir archivos:", error);
                document.getElementById('fileListDisplay').innerHTML = `<span class="text-red-400">Error de red al subir archivos. No se adjuntarán al resumen.</span>`;
                return selectedPilot.archivos_adjuntos || [];
            }
        }

        function renderSummaryAttachedFiles(archivos) {
            const summaryFilesDiv = document.getElementById('summaryAttachedFiles_resumen');
            summaryFilesDiv.innerHTML = '';
            if (archivos && archivos.length > 0) {
                const p = document.createElement('p');
                p.classList.add('text-sm', 'text-gray-400', 'mt-2', 'font-semibold');
                p.textContent = 'Archivos Adjuntos:';
                const ul = document.createElement('ul');
                ul.classList.add('list-disc', 'list-inside', 'text-sm', 'text-blue-400', 'pl-4', 'space-y-1');
                archivos.forEach(file => {
                    const li = document.createElement('li');
                    if (file.url && file.url !== '#') {
                        const a = document.createElement('a');
                        a.href = file.url;
                        a.textContent = file.nombre;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.classList.add('hover:underline');
                        // a.download = file.nombre; // Forzar descarga es opcional y a veces problemático
                        li.appendChild(a);
                    } else {
                        li.textContent = file.nombre || file;
                    }
                    ul.appendChild(li);
                });
                summaryFilesDiv.appendChild(p);
                summaryFilesDiv.appendChild(ul);
            } else {
                summaryFilesDiv.innerHTML = '<p class="text-sm text-gray-500 mt-1">No hay archivos adjuntos.</p>';
            }
        }

        function renderTechnologyCheckboxes(techList = null) {
            const checkboxesContainer = document.getElementById('selectedProcessTechnologyCheckboxes');
            checkboxesContainer.innerHTML = '';

            // Si tienes un catálogo de tecnologías, úsalo. Si no, usa una lista por defecto.
            let allTechnologies = techList;
            if (!allTechnologies) {
                // Extrae todas las tecnologías únicas del catálogo
                allTechnologies = new Set();
                if (catalogData && catalogData.categories) {
                    catalogData.categories.forEach(cat => {
                        cat.subcategories.forEach(sub => {
                            sub.projects.forEach(proj => {
                                if (proj.technology) {
                                    proj.technology.split(/[,;]/).forEach(t => allTechnologies.add(t.trim()));
                                }
                            });
                        });
                    });
                }
                allTechnologies = Array.from(allTechnologies).filter(Boolean);
                if (allTechnologies.length === 0) {
                    allTechnologies = ["RPA", "OCR", "LLM", "IA Generativa", "Motor de Reglas", "Power Automate", "Python"];
                }
            }

            allTechnologies.forEach(tech => {
                if (!tech) return;
                const label = document.createElement('label');
                label.classList.add('flex', 'items-center', 'space-x-2');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tech;
                checkbox.name = 'processTechnology';
                checkbox.classList.add('mr-2');
                // Marca el checkbox si la tecnología está en selectedPilot.selectedProcessTechnologyContent
                if (selectedPilot.selectedProcessTechnologyContent && selectedPilot.selectedProcessTechnologyContent.includes(tech)) {
                    checkbox.checked = true;
                }
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(tech));
                checkboxesContainer.appendChild(label);
            });
        }
