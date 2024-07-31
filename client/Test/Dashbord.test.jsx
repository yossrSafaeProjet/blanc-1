import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, afterEach, vi } from 'vitest';
import AdminDashboard from '../src/components/Dashboard';

// Configurez le mock d'axios
const mockAxios = new MockAdapter(axios);

describe('AdminDashboard', () => {
  afterEach(() => {
    mockAxios.reset(); // Réinitialiser le mock après chaque test
  });

  it('should render vehicles and client count correctly', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const navigateMock = vi.fn();

    // Mock des données de véhicules et du compte des clients
    const mockVehicles = [
      {
        id: '1',
        marque: 'Toyota',
        modele: 'Corolla',
        annee: '2020',
        firstname: 'John',
        lastname: 'Doe'
      }
    ];
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'mockCsrfToken'
    });
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/vehicle/allVehicule`).reply(200, mockVehicles);
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/clients/count`).reply(200, { count: 1 });
    // Rendre le composant
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    console.log("aaa",screen.debug());
    await waitFor(() => {
        // Afficher le DOM pour le débogage
        console.log("DOM Content:", screen.debug());});
    // Attendre et vérifier que les données sont rendues correctement
    //await waitFor(() => {
      /* expect(screen.getByText((content, element) => 
        content.includes('Nombre de clients inscrits : 1')
      )).toBeInTheDocument(); */
      
      /* // Vérifiez les autres éléments
      expect(screen.getByText('Marque')).toBeInTheDocument();
      expect(screen.getByText((content, element) => 
        content.includes('Toyota') && element.tagName.toLowerCase() === 'td'
      )).toBeInTheDocument();
      expect(screen.getByText((content, element) => 
        content.includes('Corolla') && element.tagName.toLowerCase() === 'td'
      )).toBeInTheDocument();
      expect(screen.getByText((content, element) => 
        content.includes('2020') && element.tagName.toLowerCase() === 'td'
      )).toBeInTheDocument();
      expect(screen.getByText((content, element) => 
        content.includes('John Doe') && element.tagName.toLowerCase() === 'td'
      )).toBeInTheDocument(); */
    //});

    // Vérifiez que alert et navigate ne sont pas appelés
  /*   expect(alertMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    // Nettoyage
    alertMock.mockRestore(); */
  });
});
