import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { Table, Container, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [vehicules, setVehicules] = useState([]);
  const navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${baseURI}api/csrf-token`, { withCredentials: true });
        console.log('Token CSRF reçu:', response.data.csrfToken);
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    };

    const fetchClientCount = async () => {
      try {
        const response = await axios.get(`${baseURI}api/clients/count`, { withCredentials: true });
        if (response.ok) {
          const data = await response.json();
          setClientCount(data.count);
        } else {
          alert('Erreur lors de la récupération du nombre de clients');
          navigate('/');
        }
      } catch (error) {
        window.alert('Erreur réseau');
        navigate('/');
      }
    };

    const fetchVehicules = async () => {
      if (!csrfToken) return; // Ne pas effectuer la requête si csrfToken n'est pas encore défini

      try {
        const response = await axios.get(`${baseURI}api/vehicle/allVehicule`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true
        });
        setVehicules(response.data);
      } catch (authError) {
        console.error('Erreur lors de la récupération des véhicules:', authError);
        alert('Une erreur est survenue lors de la récupération des véhicules.');
      }
    };

    // Fetch CSRF Token et ensuite Client Count et Vehicles
    const fetchData = async () => {
      await fetchCsrfToken();
      // Attendre que csrfToken soit défini avant de faire les appels suivants
      if (csrfToken) {
        await fetchClientCount();
        await fetchVehicules();
      }
    };

    fetchData();
  }, [navigate, csrfToken]); // Ajout de csrfToken dans les dépendances

  const handleEdit = (vehicleId) => {
    if (vehicleId) {
      navigate(`/edit-vehicle/${vehicleId}`);
    } else {
      alert('ID de véhicule non disponible.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`${baseURI}api/vehicles/deleteVehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Véhicule supprimé avec succès');
        setVehicules(vehicules.filter(vehicule => vehicule.id !== vehicleId)); // Correction de la propriété
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      alert('Erreur lors de la suppression du véhicule.');
    }
  };

  const handleAddVehicle = () => {
    navigate('/add-vehicle');
  };

  return (
    <Container className="mt-5 bg-dark text-white p-3 rounded">
      <Button variant="primary" className="mb-3" onClick={handleAddVehicle}>
        Ajouter Véhicule
      </Button>
      <h2>Tableau de bord admin</h2>
      <p>Nombre de clients inscrits : {clientCount}</p>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Année</th>
            <th>Client Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicules.map((vehicule) => (
            <tr key={vehicule.id}>
              <td>{vehicule.id}</td> {/* Correction de la propriété */}
              <td>{vehicule.marque}</td>
              <td>{vehicule.modele}</td>
              <td>{vehicule.annee}</td>
              <td>{vehicule.firstname} {vehicule.lastname}</td>
              <td>
                <Button variant="warning" aria-label="Edit" onClick={() => handleEdit(vehicule.id)} className="mr-2">
                  <FaEdit />
                </Button>
                <Button variant="danger" aria-label="Delete" onClick={() => handleDeleteVehicle(vehicule.id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminDashboard;
