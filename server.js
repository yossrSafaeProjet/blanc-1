const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const csrf = require('csurf');
const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}
// Middleware

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));
const csrfProtection = csrf({ cookie: true });
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});
const verifyTokenAndRole = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided!');
    }
    const roles = req.requiredroles || ["admin", "client"]
    try {
      const decoded = jwt.verify(token, 'OEKFNEZKkF78EZFH93023NOEAF');
      req.user = decoded;
      const sql = 'SELECT role FROM users WHERE id = ?';
      db.query(sql, [req.user.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }

        if (results.length === 0) {
          return res.status(404).send('User not found');
        }

        const userRole = results[0].role;
        if (!roles.includes(userRole)) {
        return res.status(403).send('Access Denied: You do not have the required role!');
      }

      next();
    })
    } catch (error) {
      res.status(400).send('Invalid Token');
    }
  };
// Routes
app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword)
  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'OEKFNEZKkF78EZFH93023NOEAF', { expiresIn: 86400 });
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 heures

    res.status(200).send({ auth: true, role: user.role});
  });
});

app.get('/api/clients/count', (req,_res, next) => {
  req.requiredroles = ["admin"]
  next()
},  verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results[0]);
  });
});
//Récupérer la liste des véhicule 
app.get('/api/vehicle/allVehicule', (req, res) => {
  const query = `
    SELECT 
      v.id AS vehicleId, 
      v.marque, 
      v.modele, 
      v.annee, 
      u.id AS clientId, 
      u.firstname, 
      u.lastname 
    FROM vehicules v
    JOIN users u ON v.client_id = u.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des véhicules et clients:', err);
      res.status(500).send('Erreur du serveur');
      return;
    }
    res.json(results); // Assurez-vous que `results` est un tableau
  });
});

//Récupérer tous les clients 

//Récupére toutes les clients 
app.get('/api/dashboard/clients/AllClient', (req, res) => {
  const query = 'SELECT * FROM users WHERE role = ?';
  
  db.query(query, ['admin'], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).json({ error: 'Erreur du serveur' });
      return;
    }
    res.json(results);
  });
});

//AddVehicule
app.post('/api/vehicles/addVehicle',csrfProtection, (req, res) => {
  const { marque, modele, annee, clientId } = req.body;

  const checkClientQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(checkClientQuery, [clientId], (err, clientResults) => {
    if (err) {
      console.error('Erreur lors de la vérification du client:', err);
      return res.status(500).json({ message: 'Erreur du serveur' });
    }

    if (clientResults.length === 0) {
      return res.status(400).json({ message: 'Client non trouvé' });
    }

    const addVehicleQuery = 'INSERT INTO vehicules (marque, modele, annee, client_id) VALUES (?, ?, ?, ?)';
    db.query(addVehicleQuery, [marque, modele, annee, clientId], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'ajout du véhicule:', err);
        return res.status(500).json({ message: 'Erreur lors de l\'ajout du véhicule.' });
      }

      res.status(201).json({ id: results.insertId, marque, modele, annee, clientId });
    });
  });
});
//updateVehicle
app.put('/api/vehicles/updateVehicle/:id', csrfProtection,(req, res) => {
  const vehicleId = req.params.id; // Récupération de l'ID du véhicule depuis les paramètres de l'URL
  const { marque, modele, annee, clientId } = req.body; // Récupération des autres champs depuis le corps de la requête

  // Vérifiez que tous les champs nécessaires sont fournis
  if (!marque || !modele || !annee || !clientId) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  const updateVehicleQuery = `
    UPDATE vehicules 
    SET marque = ?, modele = ?, annee = ?, client_id = ? 
    WHERE id = ?
  `;

  // Exécutez la requête SQL pour mettre à jour le véhicule
  db.query(updateVehicleQuery, [marque, modele, annee, clientId, vehicleId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du véhicule:', err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du véhicule' });
    }

    // Vérifiez si la mise à jour a affecté des lignes
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }

    res.status(200).json({ message: 'Véhicule mis à jour avec succès' });
  });
});

//Recupérer un seul vehicle 
app.get('/api/vehicles/vehicle/:id',(req, res) => {
  const vehicleId = req.params.id;
  const query = 'SELECT * FROM vehicules where id=?';
  
  db.query(query,[vehicleId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).send('Erreur du serveur');
      return;
    }
    console.log(res.json(results))
    res.json(results);
  });
});
// Route pour supprimer un véhicule
app.delete('/api/vehicles/deleteVehicle/:vehicleId', (req, res) => {
  const vehicleId = req.params.vehicleId;  // Récupérer vehicleId depuis les paramètres d'URL

  if (!vehicleId) {
    return res.status(400).json({ message: 'ID du véhicule manquant' });
  }

  // Vérifier si le véhicule existe
  const checkVehicleQuery = 'SELECT * FROM vehicules WHERE id = ?';
  db.query(checkVehicleQuery, [vehicleId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du véhicule:', err);
      return res.status(500).json({ message: 'Erreur du serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }

    // Supprimer le véhicule
    const deleteVehicleQuery = 'DELETE FROM vehicules WHERE id = ?';
    db.query(deleteVehicleQuery, [vehicleId], (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du véhicule:', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression du véhicule' });
      }

      res.status(200).json({ message: 'Véhicule supprimé avec succès' });
    });
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")))
app.get("*", (_, res) => {
    res.sendFile(
      path.join(__dirname, "./client/dist/index.html")
    )
})
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
