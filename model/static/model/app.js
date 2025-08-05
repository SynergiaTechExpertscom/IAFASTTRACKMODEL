        // --- ESTADO DE LA APLICACIÓN ---
        let clientData = {};
        let catalogData = {};
        let currentSelectedClientId = null;

        let currentFilter = "All";
        let currentSubcategoryFilter = "AllSubcategories";
        let currentSelectedSolutionId = null;
        let selectedPilots = [];
        let currentPilotIndex = -1;
        const emptyPilotTemplate = {
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
        let selectedPilot = { ...emptyPilotTemplate };
        let suggestedProjectDetails = {};
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

        const icons = {
            default: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.87891 7.51884C11.0505 6.49372 12.95 6.49372 14.1215 7.51884C15.2931 8.54397 15.2931 10.206 14.1215 11.2312C13.9176 11.4096 13.6917 11.5569 13.4513 11.6733C12.7056 12.0341 12.0002 12.6716 12.0002 13.5V14.25M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM12 17.25H12.0075V17.2575H12V17.25Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            automatizacion: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 3V4.5M4.5 8.25H3M21 8.25H19.5M4.5 12H3M21 12H19.5M4.5 15.75H3M21 15.75H19.5M8.25 19.5V21M12 3V4.5M12 19.5V21M15.75 3V4.5M15.75 19.5V21M6.75 19.5H17.25C18.4926 19.5 19.5 18.4926 19.5 17.25V6.75C19.5 5.50736 18.4926 4.5 17.25 4.5H6.75C5.50736 4.5 4.5 5.50736 4.5 6.75V17.25C4.5 18.4926 5.50736 19.5 6.75 19.5ZM7.5 7.5H16.5V16.5H7.5V7.5Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            generativa: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.8132 15.9038L9 18.75L8.1868 15.9038C7.75968 14.4089 6.59112 13.2403 5.09619 12.8132L2.25 12L5.09619 11.1868C6.59113 10.7597 7.75968 9.59112 8.1868 8.09619L9 5.25L9.8132 8.09619C10.2403 9.59113 11.4089 10.7597 12.9038 11.1868L15.75 12L12.9038 12.8132C11.4089 13.2403 10.2403 14.4089 9.8132 15.9038Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.2589 8.71454L18 9.75L17.7411 8.71454C17.4388 7.50533 16.4947 6.56117 15.2855 6.25887L14.25 6L15.2855 5.74113C16.4947 5.43883 17.4388 4.49467 17.7411 3.28546L18 2.25L18.2589 3.28546C18.5612 4.49467 19.5053 5.43883 20.7145 5.74113L21.75 6L20.7145 6.25887C19.5053 6.56117 18.5612 7.50533 18.2589 8.71454Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.8942 20.5673L16.5 21.75L16.1058 20.5673C15.8818 19.8954 15.3546 19.3682 14.6827 19.1442L13.5 18.75L14.6827 18.3558C15.3546 18.1318 15.8818 17.6046 16.1058 16.9327L16.5 15.75L16.8942 16.9327C17.1182 17.6046 17.6454 18.1318 18.3173 18.3558L19.5 18.75L18.3173 19.1442C17.6454 19.3682 17.1182 19.8954 16.8942 20.5673Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            predictiva: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 3V14.25C3.75 15.4926 4.75736 16.5 6 16.5H8.25M3.75 3H2.25M3.75 3H20.25M20.25 3H21.75M20.25 3V14.25C20.25 15.4926 19.2426 16.5 18 16.5H15.75M8.25 16.5H15.75M8.25 16.5L7.25 19.5M15.75 16.5L16.75 19.5M16.75 19.5L17.25 21M16.75 19.5H7.25M7.25 19.5L6.75 21M7.5 12L10.5 9L12.6476 11.1476C13.6542 9.70301 14.9704 8.49023 16.5 7.60539" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            optimizacion: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 18L9 11.25L13.3064 15.5564C14.5101 13.188 16.5042 11.2022 19.1203 10.0375L21.8609 8.81726M21.8609 8.81726L15.9196 6.53662M21.8609 8.81726L19.5802 14.7585" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,


        // --- ICONOS ---
        // (Revisados y actualizados en la sección Resumen y Definición)
            clientes: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.9999 18.7191C18.2474 18.7396 18.4978 18.75 18.7506 18.75C19.7989 18.75 20.8054 18.5708 21.741 18.2413C21.7473 18.1617 21.7506 18.0812 21.7506 18C21.7506 16.3431 20.4074 15 18.7506 15C18.123 15 17.5403 15.1927 17.0587 15.5222M17.9999 18.7191C18 18.7294 18 18.7397 18 18.75C18 18.975 17.9876 19.1971 17.9635 19.4156C16.2067 20.4237 14.1707 21 12 21C9.82933 21 7.79327 20.4237 6.03651 19.4156C6.01238 19.1971 6 18.975 6 18.75C6 18.7397 6.00003 18.7295 6.00008 18.7192M17.9999 18.7191C17.994 17.5426 17.6494 16.4461 17.0587 15.5222M17.0587 15.5222C15.9928 13.8552 14.1255 12.75 12 12.75C9.87479 12.75 8.00765 13.8549 6.94169 15.5216M6.94169 15.5216C6.46023 15.1925 5.87796 15 5.25073 15C3.59388 15 2.25073 16.3431 2.25073 18C2.25073 18.0812 2.25396 18.1617 2.26029 18.2413C3.19593 18.5708 4.2024 18.75 5.25073 18.75C5.50307 18.75 5.75299 18.7396 6.00008 18.7192M6.94169 15.5216C6.35071 16.4457 6.00598 17.5424 6.00008 18.7192M15 6.75C15 8.40685 13.6569 9.75 12 9.75C10.3431 9.75 9 8.40685 9 6.75C9 5.09315 10.3431 3.75 12 3.75C13.6569 3.75 15 5.09315 15 6.75ZM21 9.75C21 10.9926 19.9926 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75C16.5 8.50736 17.5074 7.5 18.75 7.5C19.9926 7.5 21 8.50736 21 9.75ZM7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.00736 12 3 10.9926 3 9.75C3 8.50736 4.00736 7.5 5.25 7.5C6.49264 7.5 7.5 8.50736 7.5 9.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            datos: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.25 14.25H18.75M5.25 14.25C3.59315 14.25 2.25 12.9069 2.25 11.25M5.25 14.25C3.59315 14.25 2.25 15.5931 2.25 17.25C2.25 18.9069 3.59315 20.25 5.25 20.25H18.75C20.4069 20.25 21.75 18.9069 21.75 17.25C21.75 15.5931 20.4069 14.25 18.75 14.25M2.25 11.25C2.25 9.59315 3.59315 8.25 5.25 8.25H18.75C20.4069 8.25 21.75 9.59315 21.75 11.25M2.25 11.25C2.25 10.2763 2.5658 9.32893 3.15 8.55L5.7375 5.1C6.37488 4.25016 7.37519 3.75 8.4375 3.75H15.5625C16.6248 3.75 17.6251 4.25016 18.2625 5.1L20.85 8.55C21.4342 9.32893 21.75 10.2763 21.75 11.25M21.75 11.25C21.75 12.9069 20.4069 14.25 18.75 14.25" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            innovacion: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5904 14.3696C15.6948 14.8128 15.75 15.275 15.75 15.75C15.75 19.0637 13.0637 21.75 9.75 21.75V16.9503M15.5904 14.3696C19.3244 11.6411 21.75 7.22874 21.75 2.25C16.7715 2.25021 12.3595 4.67586 9.63122 8.40975M15.5904 14.3696C13.8819 15.6181 11.8994 16.514 9.75 16.9503M9.63122 8.40975C9.18777 8.30528 8.72534 8.25 8.25 8.25C4.93629 8.25 2.25 10.9363 2.25 14.25H7.05072M9.63122 8.40975C8.38285 10.1183 7.48701 12.1007 7.05072 14.25M9.75 16.9503C9.64659 16.9713 9.54279 16.9912 9.43862 17.0101C8.53171 16.291 7.70991 15.4692 6.99079 14.5623C7.00969 14.4578 7.02967 14.3537 7.05072 14.25M4.81191 16.6408C3.71213 17.4612 3 18.7724 3 20.25C3 20.4869 3.0183 20.7195 3.05356 20.9464C3.28054 20.9817 3.51313 21 3.75 21C5.22758 21 6.53883 20.2879 7.35925 19.1881M16.5 9C16.5 9.82843 15.8284 10.5 15 10.5C14.1716 10.5 13.5 9.82843 13.5 9C13.5 8.17157 14.1716 7.5 15 7.5C15.8284 7.5 16.5 8.17157 16.5 9Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            finance: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6V18M9 15.1818L9.87887 15.841C11.0504 16.7197 12.9498 16.7197 14.1214 15.841C15.2929 14.9623 15.2929 13.5377 14.1214 12.659C13.5355 12.2196 12.7677 12 11.9999 12C11.275 12 10.5502 11.7804 9.99709 11.341C8.891 10.4623 8.891 9.03772 9.9971 8.15904C11.1032 7.28036 12.8965 7.28036 14.0026 8.15904L14.4175 8.48863M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            hr: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.25 14.1499V18.4C20.25 19.4944 19.4631 20.4359 18.3782 20.58C16.2915 20.857 14.1624 21 12 21C9.83757 21 7.70854 20.857 5.62185 20.58C4.5369 20.4359 3.75 19.4944 3.75 18.4V14.1499M20.25 14.1499C20.7219 13.7476 21 13.1389 21 12.4889V8.70569C21 7.62475 20.2321 6.69082 19.1631 6.53086C18.0377 6.36247 16.8995 6.23315 15.75 6.14432M20.25 14.1499C20.0564 14.315 19.8302 14.4453 19.5771 14.5294C17.1953 15.3212 14.6477 15.75 12 15.75C9.35229 15.75 6.80469 15.3212 4.42289 14.5294C4.16984 14.4452 3.94361 14.3149 3.75 14.1499M3.75 14.1499C3.27808 13.7476 3 13.1389 3 12.4889V8.70569C3 7.62475 3.7679 6.69082 4.83694 6.53086C5.96233 6.36247 7.10049 6.23315 8.25 6.14432M15.75 6.14432V5.25C15.75 4.00736 14.7426 3 13.5 3H10.5C9.25736 3 8.25 4.00736 8.25 5.25V6.14432M15.75 6.14432C14.5126 6.0487 13.262 6 12 6C10.738 6 9.48744 6.0487 8.25 6.14432M12 12.75H12.0075V12.7575H12V12.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            operations: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.39 1.024 0 1.414l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.142.854.108 1.204l.527.738c.39.39.39 1.024 0 1.414l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 010-1.414l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            reporting: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13.125C3 12.5037 3.50368 12 4.125 12H6.375C6.99632 12 7.5 12.5037 7.5 13.125V19.875C7.5 20.4963 6.99632 21 6.375 21H4.125C3.50368 21 3 20.4963 3 19.875V13.125Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.75 8.625C9.75 8.00368 10.2537 7.5 10.875 7.5H13.125C13.7463 7.5 14.25 8.00368 14.25 8.625V19.875C14.25 20.4963 13.7463 21 13.125 21H10.875C10.2537 21 9.75 20.4963 9.75 19.875V8.625Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 4.125C16.5 3.50368 17.0037 3 17.625 3H19.875C20.4963 3 21 3.50368 21 4.125V19.875C21 20.4963 20.4963 21 19.875 21H17.625C17.0037 21 16.5 20.4963 16.5 19.875V4.125Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            fraud: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9V12.75M12 2.71426C9.8495 4.75089 6.94563 6.00001 3.75 6.00001C3.69922 6.00001 3.64852 5.9997 3.59789 5.99907C3.2099 7.17918 3 8.44011 3 9.75006C3 15.3416 6.82432 20.0399 12 21.372C17.1757 20.0399 21 15.3416 21 9.75006C21 8.44011 20.7901 7.17918 20.4021 5.99907C20.3515 5.9997 20.3008 6.00001 20.25 6.00001C17.0544 6.00001 14.1505 4.75089 12 2.71426ZM12 15.75H12.0075V15.7575H12V15.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            supply: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 18.75C8.25 19.5784 7.57843 20.25 6.75 20.25C5.92157 20.25 5.25 19.5784 5.25 18.75M8.25 18.75C8.25 17.9216 7.57843 17.25 6.75 17.25C5.92157 17.25 5.25 17.9216 5.25 18.75M8.25 18.75H14.25M5.25 18.75H3.375C2.75368 18.75 2.25 18.2463 2.25 17.625V14.2504M19.5 18.75C19.5 19.5784 18.8284 20.25 18 20.25C17.1716 20.25 16.5 19.5784 16.5 18.75M19.5 18.75C19.5 17.9216 18.8284 17.25 18 17.25C17.1716 17.25 16.5 17.9216 16.5 18.75M19.5 18.75L20.625 18.75C21.2463 18.75 21.7537 18.2457 21.7154 17.6256C21.5054 14.218 20.3473 11.0669 18.5016 8.43284C18.1394 7.91592 17.5529 7.60774 16.9227 7.57315H14.25M16.5 18.75H14.25M14.25 7.57315V6.61479C14.25 6.0473 13.8275 5.56721 13.263 5.50863C11.6153 5.33764 9.94291 5.25 8.25 5.25C6.55709 5.25 4.88466 5.33764 3.23698 5.50863C2.67252 5.56721 2.25 6.0473 2.25 6.61479V14.2504M14.25 7.57315V14.2504M14.25 18.75V14.2504M14.25 14.2504H2.25" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            pricing: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.56802 3H5.25C4.00736 3 3 4.00736 3 5.25V9.56802C3 10.1648 3.23705 10.7371 3.65901 11.159L13.2401 20.7401C13.9388 21.4388 15.0199 21.6117 15.8465 21.0705C17.9271 19.7084 19.7084 17.9271 21.0705 15.8465C21.6117 15.0199 21.4388 13.9388 20.7401 13.2401L11.159 3.65901C10.7371 3.23705 10.1648 3 9.56802 3Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6H6.0075V6.0075H6V6Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            campaign: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.3404 15.8398C9.65153 15.7803 8.95431 15.75 8.25 15.75H7.5C5.01472 15.75 3 13.7353 3 11.25C3 8.76472 5.01472 6.75 7.5 6.75H8.25C8.95431 6.75 9.65153 6.71966 10.3404 6.66022M10.3404 15.8398C10.5933 16.8015 10.9237 17.7317 11.3246 18.6234C11.5721 19.1738 11.3842 19.8328 10.8616 20.1345L10.2053 20.5134C9.6539 20.8318 8.9456 20.6306 8.67841 20.0527C8.0518 18.6973 7.56541 17.2639 7.23786 15.771M10.3404 15.8398C9.95517 14.3745 9.75 12.8362 9.75 11.25C9.75 9.66379 9.95518 8.1255 10.3404 6.66022M10.3404 15.8398C13.5 16.1124 16.4845 16.9972 19.1747 18.3749M10.3404 6.66022C13.5 6.3876 16.4845 5.50283 19.1747 4.12509M19.1747 4.12509C19.057 3.74595 18.9302 3.37083 18.7944 3M19.1747 4.12509C19.7097 5.84827 20.0557 7.65462 20.1886 9.51991M19.1747 18.3749C19.057 18.7541 18.9302 19.1292 18.7944 19.5M19.1747 18.3749C19.7097 16.6517 20.0557 14.8454 20.1886 12.9801M20.1886 9.51991C20.6844 9.93264 21 10.5545 21 11.25C21 11.9455 20.6844 12.5674 20.1886 12.9801M20.1886 9.51991C20.2293 10.0913 20.25 10.6682 20.25 11.25C20.25 11.8318 20.2293 12.4087 20.1886 12.9801" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            retention: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 12C19.5 10.7681 19.4536 9.54699 19.3624 8.3384C19.2128 6.35425 17.6458 4.78724 15.6616 4.63757C14.453 4.54641 13.2319 4.5 12 4.5C10.7681 4.5 9.54699 4.54641 8.3384 4.63757C6.35425 4.78724 4.78724 6.35425 4.63757 8.3384C4.62097 8.55852 4.60585 8.77906 4.59222 9M19.5 12L22.5 9M19.5 12L16.5 9M4.5 12C4.5 13.2319 4.54641 14.453 4.63757 15.6616C4.78724 17.6458 6.35425 19.2128 8.3384 19.3624C9.54699 19.4536 10.7681 19.5 12 19.5C13.2319 19.5 14.453 19.4536 15.6616 19.3624C17.6458 19.2128 19.2128 17.6458 19.3624 15.6616C19.379 15.4415 19.3941 15.2209 19.4078 15M4.5 12L7.5 15M4.5 12L1.5 15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            all_cases: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 6C3.75 4.75736 4.75736 3.75 6 3.75H8.25C9.49264 3.75 10.5 4.75736 10.5 6V8.25C10.5 9.49264 9.49264 10.5 8.25 10.5H6C4.75736 10.5 3.75 9.49264 3.75 8.25V6Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.75 15.75C3.75 14.5074 4.75736 13.5 6 13.5H8.25C9.49264 13.5 10.5 14.5074 10.5 15.75V18C10.5 19.2426 9.49264 20.25 8.25 20.25H6C4.75736 20.25 3.75 19.2426 3.75 18V15.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 6C13.5 4.75736 14.5074 3.75 15.75 3.75H18C19.2426 3.75 20.25 4.75736 20.25 6V8.25C20.25 9.49264 19.2426 10.5 18 10.5H15.75C14.5074 10.5 13.5 9.49264 13.5 8.25V6Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 15.75C13.5 14.5074 14.5074 13.5 15.75 13.5H18C19.2426 13.5 20.25 14.5074 20.25 15.75V18C20.25 19.2426 19.2426 20.25 18 20.25H15.75C14.5074 20.25 13.5 19.2426 13.5 18V15.75Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
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
            renderSelectedProjectsList();

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
            const pdfBtn = document.getElementById('downloadPdfButton');
            if (pdfBtn) {
                pdfBtn.addEventListener('click', () => {
                    if (!currentSelectedClientId) {
                        alert('No hay cliente seleccionado.');
                        return;
                    }
                    window.open(`/descargar-pdf/${currentSelectedClientId}/`, '_blank');
                });
            }
            const aiBtn = document.getElementById('aiSearchButton');
            if (aiBtn) {
                aiBtn.addEventListener('click', handleIaSearch);
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

            if (sectionId === 'sectionAnalisis') {
                renderAnalysisTabs();
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
                renderSummaryTabs();
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
                // and the prefill logic in navigateTo('sectionAnalisis') will handle it.
            }


            const newPilot = JSON.parse(JSON.stringify(selectedPilot));
            if (currentPilotIndex === -1) {
                selectedPilots.push(newPilot);
                currentPilotIndex = selectedPilots.length - 1;
            } else {
                selectedPilots[currentPilotIndex] = newPilot;
            }
            selectedPilot = newPilot;
            renderSelectedProjectsList();
            renderAnalysisTabs();

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
                if (clientData.colaboracion_propuesta && clientData.colaboracion_propuesta.length > 0) {
                    const grouped = {};
                    clientData.colaboracion_propuesta.forEach((projectName, idx) => {
                        const projectDetails = findProjectByNameAcrossAllCategories(projectName);
                        let project, categoryName, subcategoryName, projectUniqueId;
                        if (projectDetails) {
                            project = projectDetails.project;
                            categoryName = projectDetails.categoryName;
                            subcategoryName = projectDetails.subcategoryName;
                            projectUniqueId = project.id;
                        } else {
                            const custom = suggestedProjectDetails[projectName];
                            if (custom) {
                                project = {
                                    projectName: custom.projectName,
                                    description: custom.description,
                                    technology: custom.technology
                                };
                                categoryName = custom.categoryName || 'Otros';
                                subcategoryName = custom.subcategoryName || 'Otro';
                                projectUniqueId = custom.id || `suggested_${idx}`;
                            } else {
                                project = { projectName: projectName, description: "", technology: "" };
                                categoryName = "Sugeridos";
                                subcategoryName = "Sin Categoría";
                                projectUniqueId = `suggested_${idx}`;
                            }
                        }
                        project.originalCategoryName = categoryName;
                        project.originalSubcategoryName = subcategoryName;
                        project.id = projectUniqueId;
                        if (!grouped[categoryName]) grouped[categoryName] = {};
                        if (!grouped[categoryName][subcategoryName]) grouped[categoryName][subcategoryName] = [];
                        grouped[categoryName][subcategoryName].push(project);
                    });

                    Object.keys(grouped).forEach(catName => {
                        const categoryColors = getCategoryColors(catName);
                        const categoryHeaderEl = document.createElement('h3');
                        categoryHeaderEl.classList.add('category-header');
                        categoryHeaderEl.textContent = catName;
                        categoryHeaderEl.style.color = categoryColors.text;
                        categoryHeaderEl.style.borderBottomColor = categoryColors.border;
                        catalogContainer.appendChild(categoryHeaderEl);

                        const subcats = grouped[catName];
                        Object.keys(subcats).forEach(subcatName => {
                            const subcategoryHeaderEl = document.createElement('h4');
                            subcategoryHeaderEl.classList.add('subcategory-header');
                            subcategoryHeaderEl.textContent = subcatName;
                            subcategoryHeaderEl.style.color = categoryColors.text;
                            subcategoryHeaderEl.style.borderBottomColor = categoryColors.border;
                            catalogContainer.appendChild(subcategoryHeaderEl);

                            subcats[subcatName].forEach(project => {
                                foundAnyProjectOverall = true;
                                const solutionDiv = document.createElement('div');
                                solutionDiv.classList.add('solution-card');
                                solutionDiv.dataset.solutionId = project.id;

                                const isSelected = selectedPilots.some(p => p.solutionId === project.id);
                                if (isSelected) {
                                    solutionDiv.classList.add('solution-card-selected');
                                    solutionDiv.style.borderColor = categoryColors.iconFill;
                                } else {
                                    solutionDiv.style.borderColor = categoryColors.border;
                                }

                                const titleEl = document.createElement('h5');
                                titleEl.classList.add('font-semibold', 'text-lg', 'mb-1');
                                titleEl.textContent = project.projectName;
                                titleEl.style.color = categoryColors.iconFill;
                                solutionDiv.appendChild(titleEl);

                                const contextP = document.createElement('p');
                                contextP.classList.add('text-xs', 'text-gray-400', 'mb-2', 'italic');
                                contextP.textContent = `(De: ${project.originalCategoryName} / ${project.originalSubcategoryName})`;
                                solutionDiv.appendChild(contextP);

                                solutionDiv.innerHTML += `
                <p class="text-sm text-gray-300 mt-1 mb-3">${project.description || "Sin descripción."}</p>
                <p class="text-xs text-gray-400 mb-2"><strong>Tecnología:</strong> ${project.technology || 'No especificada'}</p>
            `;

                                const selectBtn = document.createElement('button');
                                selectBtn.className = "text-xs btn-secondary py-1 px-2 mt-auto";
                                selectBtn.style.backgroundColor = categoryColors.bg;
                                selectBtn.style.borderColor = categoryColors.border;
                                selectBtn.textContent = isSelected ? "Quitar" : "Seleccionar";
                                selectBtn.onclick = () => selectSolutionForPilot(project.id);
                                solutionDiv.appendChild(selectBtn);

                                catalogContainer.appendChild(solutionDiv);
                            });
                        });
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
                                    const isSelected = selectedPilots.some(p => p.solutionId === project.id);
                                    solutionDiv.style.borderColor = isSelected ? categoryColors.iconFill : categoryColors.border;

                                    const isSuggestedByData = clientData.colaboracion_propuesta && clientData.colaboracion_propuesta.includes(project.projectName);
                                    if (isSuggestedByData) {
                                        solutionDiv.classList.add('suggested-highlight');
                                    }
                                    if (isSelected) {
                                        solutionDiv.classList.add('solution-card-selected');
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
                                <button class="text-xs btn-secondary py-1 px-2 mt-auto" style="background-color:${categoryColors.bg}; border-color:${categoryColors.border};" onclick="selectSolutionForPilot('${project.id}')">${isSelected ? 'Quitar' : 'Seleccionar'}</button>
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
                showGeneralMessage("Error: No se pudo encontrar la solución seleccionada.", 'error');
                return;
            }

            const existingIndex = selectedPilots.findIndex(p => p.solutionId === solutionId);
            if (existingIndex !== -1) {
                selectedPilots.splice(existingIndex, 1);
                if (currentPilotIndex === existingIndex) {
                    currentPilotIndex = selectedPilots.length > 0 ? 0 : -1;
                    selectedPilot = selectedPilots[currentPilotIndex] || selectedPilot;
                }
                renderProcessCatalog();
                renderSelectedProjectsList();
                renderAnalysisTabs();
                return;
            }

            const newPilot = {
                solutionId: actualSolutionDetails.project.id,
                name: actualSolutionDetails.project.projectName,
                description: actualSolutionDetails.project.description || "",
                technology: actualSolutionDetails.project.technology || "",
                valueProposition: actualSolutionDetails.project.valueProposition || "",
                salesPitch: actualSolutionDetails.project.salesPitch || "",
                kpis: (actualSolutionDetails.project.kpis || []).map((kpi, idx) => ({ id: `kpi-cat-${idx}`, name: kpi.name, currentValue: "Por definir", targetValue: kpi.value, impactValue: "" })),
                monthlyROI: (actualSolutionDetails.project.monthlyROI || []).map((roi, idx) => ({ id: `roi-cat-${idx}`, name: roi.name, value: roi.value })),
                currentProcessDescription: "",
                attachedFileNames: [],
                selectedProcessNameContent: actualSolutionDetails.project.projectName,
                selectedProcessDescriptionContent: actualSolutionDetails.project.description || "",
                selectedProcessTechnologyContent: actualSolutionDetails.project.technology ? actualSolutionDetails.project.technology.split(/[,;]/).map(t => t.trim()) : [],
                originalProjectData: actualSolutionDetails.project,
                originalCategoryName: actualSolutionDetails.categoryName,
                originalSubcategoryName: actualSolutionDetails.subcategoryName,
                archivos_adjuntos: []
            };

            selectedPilots.push(newPilot);
            currentPilotIndex = selectedPilots.length - 1;
            selectedPilot = newPilot;

            renderProcessCatalog();
            renderSelectedProjectsList();
            renderAnalysisTabs();
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

        function addAiProjectDirect(project) {
            const newPilot = {
                solutionId: project.id || `custom_${selectedPilots.length}`,
                name: project.projectName || project.name || 'Otro',
                description: project.description || '',
                technology: project.technology || '',
                valueProposition: project.valueProposition || '',
                salesPitch: project.salesPitch || '',
                kpis: project.kpis || [],
                monthlyROI: project.monthlyROI || [],
                currentProcessDescription: '',
                attachedFileNames: [],
                selectedProcessNameContent: project.projectName || project.name || '',
                selectedProcessDescriptionContent: project.description || '',
                selectedProcessTechnologyContent: project.technology ? project.technology.split(/[,;]/).map(t => t.trim()) : [],
                originalProjectData: project,
                originalCategoryName: project.categoryName || 'Otros',
                originalSubcategoryName: project.subcategoryName || 'Otro',
                archivos_adjuntos: []
            };
            selectedPilots.push(newPilot);
            currentPilotIndex = selectedPilots.length - 1;
            selectedPilot = newPilot;
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
                saveCurrentPilotData();

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
                const problemaIcon = summaryProblemaTitle.querySelector('svg');
                if (problemaIcon) problemaIcon.style.fill = colors.iconFill;

                const summarySolucionTitle = document.getElementById('summarySolucionTitle');
                summarySolucionTitle.style.color = colors.text;
                summarySolucionTitle.style.borderBottomColor = colors.border;
                const solucionIcon = summarySolucionTitle.querySelector('svg');
                if (solucionIcon) solucionIcon.style.fill = colors.iconFill;

                const summaryValorTitle = document.getElementById('summaryValorTitle');
                summaryValorTitle.style.color = colors.text;
                summaryValorTitle.style.borderBottomColor = colors.border;
                const valorIcon = summaryValorTitle.querySelector('svg');
                if (valorIcon) valorIcon.style.fill = colors.iconFill;

                const summaryFasesTitle = document.getElementById('summaryFasesTitle');
                summaryFasesTitle.style.color = colors.text;
                summaryFasesTitle.style.borderBottomColor = colors.border;
                const fasesIcon = summaryFasesTitle.querySelector('svg');
                if (fasesIcon) fasesIcon.style.fill = colors.iconFill;

                const summaryKpiTitle = document.getElementById('summaryKpiTitle');
                summaryKpiTitle.style.color = colors.text;
                summaryKpiTitle.style.borderBottomColor = colors.border;
                const kpiIcon = summaryKpiTitle.querySelector('svg');
                if (kpiIcon) kpiIcon.style.fill = colors.iconFill;

                const summaryRoiTitle = document.getElementById('summaryRoiTitle');
                summaryRoiTitle.style.color = colors.text;
                summaryRoiTitle.style.borderBottomColor = colors.border;
                const roiIcon = summaryRoiTitle.querySelector('svg');
                if (roiIcon) roiIcon.style.fill = colors.iconFill;

                const summaryPitchTitle = document.getElementById('summaryPitchTitle');
                summaryPitchTitle.style.color = colors.text;
                summaryPitchTitle.style.borderBottomColor = colors.border;
                const pitchIcon = summaryPitchTitle.querySelector('svg');
                if (pitchIcon) pitchIcon.style.fill = colors.iconFill;


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
                proyectos: selectedPilots.map(p => ({
                    nombre_piloto: p.name,
                    categoria_piloto: p.originalCategoryName,
                    subcategoria_piloto: p.originalSubcategoryName,
                    problema_actual_descripcion: p.currentProcessDescription,
                    solucion_descripcion: p.description,
                    solucion_tecnologias: p.technology,
                    propuesta_valor: p.valueProposition,
                    kpis: p.kpis.map(k => ({ nombre: k.name, valor_actual: k.currentValue, valor_objetivo: k.targetValue, impacto_esperado: k.impactValue })),
                    roi_indicativo: p.monthlyROI.map(r => ({ nombre: r.name, valor: r.value })),
                    pitch_ventas: p.salesPitch,
                    archivos_adjuntos: p.archivos_adjuntos
                }))
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

        async function handleIaSearch() {
            const prompt = document.getElementById('aiPromptInput').value.trim();
            if (!prompt) return;
            const loader = document.getElementById('iaLoader');
            if (loader) loader.classList.remove('hidden');
            clientData.colaboracion_propuesta = [];
            suggestedProjectDetails = {};
            try {
                const response = await fetch('/api/buscar_proyectos_ia/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken && { 'X-CSRFToken': csrfToken })
                    },
                    body: JSON.stringify({ prompt })
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data.projects) && data.projects.length > 0) {
                    clientData.colaboracion_propuesta = data.projects.map(p => p.projectName);
                    data.projects.forEach(p => {
                        suggestedProjectDetails[p.projectName] = {
                            projectName: p.projectName,
                            description: p.description || '',
                            technology: p.technology || '',
                            categoryName: p.categoryName || 'Otros',
                            subcategoryName: p.subcategoryName || 'Otro',
                            id: p.id
                        };
                    });
                } else {
                    let nuevo = data.otro;
                    if (!nuevo) {
                        try {
                            const resp2 = await fetch('/api/buscar_proyectos_ia/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(csrfToken && { 'X-CSRFToken': csrfToken })
                                },
                                body: JSON.stringify({ prompt })
                            });
                            const data2 = await resp2.json();
                            nuevo = data2.otro;
                        } catch (e) {
                            console.error('Error solicitando proyecto alternativo:', e);
                        }
                    }
                    if (nuevo) {
                        const name = nuevo.name || 'Otro';
                        clientData.colaboracion_propuesta = [name];
                        suggestedProjectDetails[name] = {
                            projectName: name,
                            description: nuevo.description || '',
                            technology: nuevo.technology || '',
                            categoryName: 'Otros',
                            subcategoryName: 'Otro',
                            id: `suggested_${Date.now()}`
                        };
                    }
                }
            } catch (err) {
                console.error('Error buscando proyectos IA:', err);
            }
            if (loader) loader.classList.add('hidden');
            document.getElementById('aiPromptInput').value = '';
            currentFilter = 'Suggested';
            setupMainFilters();
            updateSubcategoryFilters();
            renderProcessCatalog();
            loadClientData();
            renderSelectedProjectsList();
            renderAnalysisTabs();
        }

        function renderAnalysisTabs() {
            const tabsContainer = document.getElementById('analysisTabs');
            if (!tabsContainer) return;
            tabsContainer.innerHTML = '';
            selectedPilots.forEach((p, idx) => {
                const colors = getCategoryColors(p.originalCategoryName || 'Default');
                const btn = document.createElement('button');
                btn.className = 'tab-button';
                btn.textContent = p.name || `Proyecto ${idx + 1}`;
                btn.style.backgroundColor = idx === currentPilotIndex ? colors.bg : 'transparent';
                btn.style.color = idx === currentPilotIndex ? colors.text : colors.iconFill;
                btn.style.borderColor = colors.border;
                btn.onclick = () => switchPilot(idx);
                tabsContainer.appendChild(btn);
            });
        }

        function switchPilot(index) {
            if (index === currentPilotIndex || index < 0 || index >= selectedPilots.length) return;
            saveCurrentPilotData();
            currentPilotIndex = index;
            selectedPilot = selectedPilots[index];
            loadPilotIntoForm();
            renderAnalysisTabs();
        }

        function loadPilotIntoForm() {
            const pilotName = selectedPilot.name || selectedPilot.selectedProcessNameContent || "Definición del Piloto";
            const categoryName = selectedPilot.originalCategoryName || "Default";
            const subcategoryName = selectedPilot.originalSubcategoryName || "";
            const colors = getCategoryColors(categoryName);

            const defHeaderBg = document.getElementById('definitionHeader');
            const defHeader = document.getElementById('definitionPilotNameHeader');
            const catSubcat = document.getElementById('definitionPilotCategorySubcategory');
            if (defHeaderBg && defHeader) {
                defHeaderBg.style.backgroundColor = colors.bg;
                defHeader.textContent = pilotName;
                defHeader.style.color = colors.text;
                catSubcat.textContent = categoryName + (subcategoryName ? ' / ' + subcategoryName : '');
                catSubcat.style.color = colors.text;
                catSubcat.style.backgroundColor = colors.border;
            }

            document.getElementById('pilotoNameInput').value = selectedPilot.name || '';
            document.getElementById('pilotDescription').value = selectedPilot.description || '';
            document.getElementById('pilotTechnology').value = selectedPilot.technology || '';
            document.getElementById('pilotValueProposition').value = selectedPilot.valueProposition || '';
            document.getElementById('pilotSalesPitch').value = selectedPilot.salesPitch || '';
            renderKpiInputs(selectedPilot.kpis);
            renderRoiInputs(selectedPilot.monthlyROI);
        }

        function saveCurrentPilotData() {
            if (currentPilotIndex === -1) return;
            selectedPilot.name = document.getElementById('pilotoNameInput').value;
            selectedPilot.description = document.getElementById('pilotDescription').value;
            selectedPilot.technology = document.getElementById('pilotTechnology').value;
            selectedPilot.valueProposition = document.getElementById('pilotValueProposition').value;
            selectedPilot.salesPitch = document.getElementById('pilotSalesPitch').value;

            selectedPilot.kpis = [];
            document.querySelectorAll('#kpiContainer .dynamic-input-group').forEach(group => {
                const id = group.dataset.kpiId;
                const kpiNameInput = document.getElementById(`kpiName-${id}`);
                if (kpiNameInput && kpiNameInput.value.trim() !== '') {
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
                if (roiNameInput && roiNameInput.value.trim() !== '') {
                    selectedPilot.monthlyROI.push({
                        name: roiNameInput.value,
                        value: document.getElementById(`roiValue-${id}`).value
                    });
                }
            });
        }

        function renderSummaryTabs() {
            const tabsContainer = document.getElementById('summaryTabs');
            if (!tabsContainer) return;
            tabsContainer.innerHTML = '';
            selectedPilots.forEach((p, idx) => {
                const colors = getCategoryColors(p.originalCategoryName || 'Default');
                const btn = document.createElement('button');
                btn.className = 'tab-button';
                btn.textContent = p.name || `Proyecto ${idx + 1}`;
                btn.style.backgroundColor = idx === currentPilotIndex ? colors.bg : 'transparent';
                btn.style.color = idx === currentPilotIndex ? colors.text : colors.iconFill;
                btn.style.borderColor = colors.border;
                btn.onclick = () => { switchPilot(idx); generateSummary(); };
                tabsContainer.appendChild(btn);
            });
        }

        function renderSelectedProjectsList() {
            const list = document.getElementById('selectedProjectsList');
            if (!list) return;
            list.innerHTML = '';
            if (selectedPilots.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No hay proyectos seleccionados.';
                li.classList.add('text-sm', 'text-gray-400');
                list.appendChild(li);
                return;
            }
            selectedPilots.forEach((p, idx) => {
                const li = document.createElement('li');
                li.className = 'selected-project-item';
                const infoBtn = document.createElement('button');
                infoBtn.className = 'selected-project-link';
                const cat = p.originalCategoryName || '';
                const subcat = p.originalSubcategoryName || '';
                infoBtn.textContent = `${p.name || `Proyecto ${idx + 1}`}${cat ? ' - ' + cat : ''}${subcat ? ' / ' + subcat : ''}`;
                infoBtn.onclick = () => loadProjectIntoSelectionForm(idx);
                li.appendChild(infoBtn);
                const btn = document.createElement('button');
                btn.className = 'remove-btn';
                btn.textContent = 'Quitar';
                btn.onclick = () => removeSelectedProject(idx);
                li.appendChild(btn);
                list.appendChild(li);
            });
        }

        function saveCurrentProcessSelection() {
            if (!selectedPilot) return;
            selectedPilot.selectedProcessNameContent = document.getElementById('selectedProcessName').value;
            selectedPilot.selectedProcessDescriptionContent = document.getElementById('selectedProcessDescription').value;
            selectedPilot.currentProcessDescription = document.getElementById('currentProcessDescription').value;
            const techs = [];
            document.querySelectorAll('#selectedProcessTechnologyCheckboxes input[type="checkbox"]:checked').forEach(cb => {
                techs.push(cb.value);
            });
            selectedPilot.selectedProcessTechnologyContent = techs;
            if (selectedPilot.selectedProcessNameContent) {
                selectedPilot.name = selectedPilot.selectedProcessNameContent;
            }
        }

        function loadProjectIntoSelectionForm(index) {
            if (index < 0 || index >= selectedPilots.length) return;
            saveCurrentProcessSelection();
            currentPilotIndex = index;
            selectedPilot = selectedPilots[index];
            document.getElementById('selectedProcessName').value = selectedPilot.selectedProcessNameContent || '';
            document.getElementById('selectedProcessDescription').value = selectedPilot.selectedProcessDescriptionContent || '';
            document.getElementById('currentProcessDescription').value = selectedPilot.currentProcessDescription || '';
            renderTechnologyCheckboxes();
            const container = document.getElementById('selectedProcessTechnologyCheckboxes');
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = selectedPilot.selectedProcessTechnologyContent.includes(cb.value);
            });
            document.getElementById('currentProcessFiles').value = '';
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
                    li.textContent = name + ' (pendiente de guardar)';
                    ul.appendChild(li);
                });
                fileDisplay.appendChild(ul);
            }
        }

        function removeSelectedProject(index) {
            if (index < 0 || index >= selectedPilots.length) return;
            selectedPilots.splice(index, 1);
            if (currentPilotIndex >= selectedPilots.length) {
                currentPilotIndex = selectedPilots.length - 1;
            }
            selectedPilot = selectedPilots[currentPilotIndex] || { ...emptyPilotTemplate };
            renderProcessCatalog();
            renderSelectedProjectsList();
            renderAnalysisTabs();
        }
