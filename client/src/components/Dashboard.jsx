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
        const response = await axios.get(`${baseURI}api/csrf-token`);
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    };
    const fetchClientCount = async () => {
      try {
        const response = await fetch(`${baseURI}api/clients/count`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setClientCount(data.count);
        } else {
          alert('Erreur lors de la récupération du nombre de clients');
          navigate('/');
        }
      } catch (error) {
        alert('Erreur réseau');
        navigate('/');
      }
    };

    const fetchVehicules = async () => {
    
        const response = await axios.get(`${baseURI}api/vehicle/allVehicule`);
        console.log('Réponse de l\'API:', response.data);
        setVehicules(response.data);
      } /* catch (error) {
        console.error('Erreur lors de la récupération des véhicules:', error);
        alert('Erreur lors de la récupération des véhicules.');
      } */
  

    fetchClientCount();
    fetchVehicules();
  }, [navigate]);

  const handleEdit = (vehicleId) => {
    if (vehicleId) {
      navigate(`/edit-vehicle/${vehicleId}`); // Redirection vers la page d'édition en passant l'ID dans l'URL
    } else {
      alert('ID de véhicule non disponible.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`${baseURI}api/vehicles/deleteVehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include', // Assurez-vous que les cookies (tokens) sont envoyés si nécessaire
      });

      const data = await response.json();

      if (response.ok) {
        alert('Véhicule supprimé avec succès');
        setVehicules(vehicules.filter(vehicule => vehicule.
          vehicleId !== vehicleId));
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur lors de la suppression du véhicule.');
    }
  };

  const handleAddVehicle = () => {
    navigate('/add-vehicle'); // Redirige vers la page d'ajout de véhicule
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
              <td>{vehicule.
vehicleId}</td>
              <td>{vehicule.marque}</td>
              <td>{vehicule.modele}</td>
              <td>{vehicule.annee}</td>
              <td>{vehicule.firstname} {vehicule.lastname}</td>
              <td>
                <Button variant="warning" aria-label="Edit" onClick={() => handleEdit(vehicule.
vehicleId)} className="mr-2">
                  <FaEdit />
                </Button>
                <Button variant="danger" aria-label="Delete" onClick={() => handleDeleteVehicle(vehicule.
vehicleId)}>
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
