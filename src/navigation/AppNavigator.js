// src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../store/authStore';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import CambiarPasswordScreen from '../screens/auth/CambiarPasswordScreen';

// System (Super Admin)
import SystemHomeScreen from '../screens/system/SystemHomeScreen';
import ListarEmpresasScreen from '../screens/system/ListarEmpresasScreen';
import CrearEmpresaScreen from '../screens/system/CrearEmpresaScreen';
import EditarEmpresaScreen from '../screens/system/EditarEmpresaScreen';
import GestionarAdminsScreen from '../screens/system/GestionarAdminsScreen';
import GestionarTrabajadoresScreen from '../screens/system/GestionarTrabajadoresScreen';
import LogsSistemaScreen from '../screens/system/LogsSistemaScreen';

// Admin
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import TrabajosListScreen from '../screens/admin/TrabajosListScreen';
import CrearTrabajoScreen from '../screens/admin/CrearTrabajoScreen';
import EditarTrabajoScreen from '../screens/admin/EditarTrabajoScreen';
import RegistrarOTScreen from '../screens/admin/RegistrarOTScreen';
import OTsListScreen from '../screens/admin/OTsListScreen';
import DetalleOTScreen from '../screens/admin/DetalleOTScreen';
import CronogramaScreen from '../screens/admin/CronogramaScreen';
import ListaBusesScreen from '../screens/admin/ListaBusesScreen';
import UsuariosListScreen from '../screens/admin/UsuariosListScreen';
import CrearUsuarioScreen from '../screens/admin/CrearUsuarioScreen';
import EditarUsuarioScreen from '../screens/admin/EditarUsuarioScreen';
import ConfigurarColoresScreen from '../screens/admin/ConfigurarColoresScreen';

// Worker
import WorkerHomeScreen from '../screens/worker/WorkerHomeScreen';
import WorkerOTsListScreen from '../screens/worker/WorkerOTsListScreen';
import WorkerDetalleOTScreen from '../screens/worker/WorkerDetalleOTScreen';
import WorkerCronogramaScreen from '../screens/worker/WorkerCronogramaScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user, logoutCount } = useAuthStore();
 
  if (!isAuthenticated) {
    return (
      <NavigationContainer key={`not-authenticated-${logoutCount}`}>
        <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
 
  // Navegación según rol
if (user?.rol === 'super_admin') {
  return (
    <NavigationContainer key="super-admin">
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
        <Stack.Screen name="SystemHome" component={SystemHomeScreen} />
        <Stack.Screen name="ListarEmpresas" component={ListarEmpresasScreen} />
        <Stack.Screen name="CrearEmpresa" component={CrearEmpresaScreen} />
        <Stack.Screen name="EditarEmpresa" component={EditarEmpresaScreen} />
        <Stack.Screen name="GestionarAdmins" component={GestionarAdminsScreen} />
        <Stack.Screen name="GestionarTrabajadores" component={GestionarTrabajadoresScreen} />
        <Stack.Screen name="LogsSistema" component={LogsSistemaScreen} />
        <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 
if (user?.rol === 'admin') {
  return (
    <NavigationContainer key="admin">
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="RegistrarOT" component={RegistrarOTScreen} />
        <Stack.Screen name="OTsList" component={OTsListScreen} />
        <Stack.Screen name="DetalleOT" component={DetalleOTScreen} />
        <Stack.Screen name="ListaBuses" component={ListaBusesScreen} />
        <Stack.Screen name="TrabajosList" component={TrabajosListScreen} />
        <Stack.Screen name="CrearTrabajo" component={CrearTrabajoScreen} />
        <Stack.Screen name="EditarTrabajo" component={EditarTrabajoScreen} />
        <Stack.Screen name="Cronograma" component={CronogramaScreen} />
        <Stack.Screen name="UsuariosList" component={UsuariosListScreen} />
        <Stack.Screen name="CrearUsuario" component={CrearUsuarioScreen} />
        <Stack.Screen name="EditarUsuario" component={EditarUsuarioScreen} />
        <Stack.Screen name="ConfigurarColores" component={ConfigurarColoresScreen} />
        <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 
// Navegación para Trabajador
if (user?.rol === 'trabajador') {
  return (
    <NavigationContainer key="trabajador">
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
        <Stack.Screen name="WorkerHome" component={WorkerHomeScreen} />
        <Stack.Screen name="WorkerOTsList" component={WorkerOTsListScreen} />
        <Stack.Screen name="WorkerDetalleOT" component={WorkerDetalleOTScreen} />
        <Stack.Screen name="WorkerCronograma" component={WorkerCronogramaScreen} />
        <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

  return null;
}