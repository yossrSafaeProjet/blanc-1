import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AddVehicleForm from '../src/components/AddVehicleForm';
import userEvent from '@testing-library/user-event';

// Configurez le mock d'axios
const mockAxios = new MockAdapter(axios);
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }) // Mocking useParams for edit mode tests
  };
});

describe('AddVehicleForm', () => {
  afterEach(() => {
    mockAxios.reset(); // Reset mock adapter after each test
  });

  describe('renders form fields', () => {
    it('should render all form fields correctly', async () => {
      mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
        csrfToken: 'mockCsrfToken'
      });
      mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/AllClient`).reply(200, [
        { id: '1', firstname: 'John', lastname: 'Doe' }
      ]);

      render(
        <MemoryRouter>
          <AddVehicleForm mode="add" />
        </MemoryRouter>
      );

      expect(await screen.findByLabelText(/Marque/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Modèle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Année/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should submit the form with correct data on add mode', async () => {
      mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
        csrfToken: 'mockCsrfToken'
      });
      mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/AllClient`).reply(200, [
        { id: '1', firstname: 'John', lastname: 'Doe' }
      ]);
      mockAxios.onPost(`${import.meta.env.VITE_API_BASE_URL}api/vehicles/addVehicle`).reply(200);

      const alertSpy = vi.spyOn(window, 'alert').mockReturnValue();

      render(
        <MemoryRouter>
          <AddVehicleForm mode="add" />
        </MemoryRouter>
      );

      // Remplir les champs du formulaire
      await userEvent.type(await screen.findByLabelText(/Marque/i), 'Toyota');
      await userEvent.type(screen.getByLabelText(/Modèle/i), 'Corolla');
      await userEvent.type(screen.getByLabelText(/Année/i), '2020');
      await userEvent.selectOptions(screen.getByLabelText(/Client/i), ['1']);

      // Soumettre le formulaire
      const submitButton = screen.getByRole('button', { name: /Ajouter/i });
      userEvent.click(submitButton);

      await waitFor(() => {
        const postData = mockAxios.history.post[0];
        expect(postData).toBeDefined(); // Vérifiez que les données de la requête existent
        expect(postData.data).toBeDefined();
        const requestData = postData.data;
        expect(requestData).toBeDefined(); 
        expect(postData.data).contain("Toyota");
      expect(postData.data).contain('Corolla');
        expect(postData.data).contain('2020');
     
        expect(alertSpy).toHaveBeenCalledWith('Véhicule ajouté avec succès');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard'); 
      });
    });
  });
});
