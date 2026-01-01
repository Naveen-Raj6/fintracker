import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            "Dashboard": "Dashboard",
            "Login": "Login",
            "Register": "Register",
            "Total Balance": "Total Balance",
            "Income": "Income",
            "Expenses": "Expenses",
            "Add Expense": "Add Expense",
            "Category": "Category",
            "Amount": "Amount",
            "Date": "Date",
            "Description": "Description",
            "Actions": "Actions",
            "Budget Alert": "Budget Alert: You have exceeded 80% of your monthly budget!",
            "Logout": "Logout",
            "Welcome": "Welcome",
            "Global Analytics": "Global Analytics",
            "Transactions": "Transactions"
        }
    },
    es: {
        translation: {
            "Dashboard": "Tablero",
            "Login": "Iniciar Sesión",
            "Register": "Registrarse",
            "Total Balance": "Balance Total",
            "Income": "Ingresos",
            "Expenses": "Gastos",
            "Add Expense": "Añadir Gasto",
            "Category": "Categoría",
            "Amount": "Cantidad",
            "Date": "Fecha",
            "Description": "Descripción",
            "Actions": "Acciones",
            "Budget Alert": "Alerta de Presupuesto: ¡Has superado el 80% de tu presupuesto mensual!",
            "Logout": "Cerrar Sesión",
            "Welcome": "Bienvenido",
            "Global Analytics": "Analítica Global",
            "Transactions": "Transacciones"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
