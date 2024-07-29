// __tests__/AddEditVehicleForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import axios from 'axios';
import AddVehicleForm from '../components/AddVehicleForm'; // Ajustez le chemin selon votre structure de projet

vi.mock('axios');

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: '1' }));

describe('AddEditVehicleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form for adding a vehicle', () => {
    render(<AddVehicleForm mode="add" />);
    expect(screen.getByLabelText(/Marque/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modèle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Année/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
  });

  it('should fetch and display vehicle data when in edit mode', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: '2020',
        clientId: '1'
      }
    });
    axios.get.mockResolvedValueOnce({
      data: [
        { id: '1', firstname: 'John', lastname: 'Doe' }
      ]
    });

    render(<AddVehicleForm mode="edit" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Corolla')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle form submission for adding a vehicle', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<AddVehicleForm mode="add" />);

    fireEvent.change(screen.getByLabelText(/Marque/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/Modèle/i), { target: { value: 'Corolla' } });
    fireEvent.change(screen.getByLabelText(/Année/i), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText(/Client/i), { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Ajouter/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('addVehicle'), {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: '2020',
        clientId: '1'
      });
    });
  });

  it('should handle form submission for editing a vehicle', async () => {
    axios.put.mockResolvedValueOnce({ data: {} });

    render(<AddVehicleForm mode="edit" />);

    fireEvent.change(screen.getByLabelText(/Marque/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/Modèle/i), { target: { value: 'Corolla' } });
    fireEvent.change(screen.getByLabelText(/Année/i), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText(/Client/i), { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Modifier/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('updateVehicle/1'), {
        marque: 'Toyota',
        modele: 'Corolla',
        annee: '2020',
        clientId: '1'
      });
    });
  });
});
