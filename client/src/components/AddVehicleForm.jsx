import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate,useParams  } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AddEditVehicleForm = ({mode }) => {
  const [vehicle, setVehicle] = useState({
    marque: '',
    modele: '',
    annee: '',
    clientId: ''
  });
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${baseURI}api/dashboard/clients/AllClient`);
        setClients(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        window.alert('Erreur lors de la récupération des clients.');
      }
    };

    if (mode === 'edit' && id) {
      // Fetch vehicle data for editing
      const fetchVehicle = async () => {
        try {
          const response = await axios.get(`${baseURI}api/vehicles/vehicle/${id}`);
          console.log('Données du véhicule:', response.data);
          setVehicle(response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération du véhicule:', error);
          window.alert('Erreur lors de la récupération du véhicule.');
        }
      };
      fetchVehicle();
    }

    fetchClients();
  }, [mode, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'edit') {
        await axios.put(`${baseURI}api/vehicles/updateVehicle/${id}`, vehicle, {
          headers: {
            'X-CSRF-Token': csrfToken
          },
          withCredentials: true});
        window.alert('Véhicule mis à jour avec succès');
        navigate('/dashboard');
      } else {
        await axios.post(`${baseURI}api/vehicles/addVehicle`, vehicle,{
          headers: {
            'X-CSRF-Token': csrfToken
          },
          withCredentials: true});
        window.alert('Véhicule ajouté avec succès');
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout ou de la mise à jour du véhicule:', error);
      window.alert('Erreur lors de l\'ajout ou de la mise à jour du véhicule.');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group controlId="formMarque">
        <Form.Label>Marque</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer la marque"
          name="marque"
          value={vehicle.marque}
          onChange={handleInputChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formModele">
        <Form.Label>Modèle</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le modèle"
          name="modele"
          value={vehicle.modele}
          onChange={handleInputChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formAnnee">
        <Form.Label>Année</Form.Label>
        <Form.Control
          type="number"
          placeholder="Entrer l'année"
          name="annee"
          value={vehicle.annee}
          onChange={handleInputChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formClientId">
        <Form.Label>Client</Form.Label>
        <Form.Control
          as="select"
          name="clientId"
          value={vehicle.clientId}
          onChange={handleInputChange}
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.firstname} {client.lastname}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button variant="primary" type="submit">
        {mode === 'edit' ? 'Modifier' : 'Ajouter'}
      </Button>
    </Form>
  );
};

export default AddEditVehicleForm;