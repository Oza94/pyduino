# pyduino

Dépôt pour l'application RaspberryPI de l'atelier PyDuino @ DigitalStudio. 

## Installation

Node.js doit être installé sur le RaspberryPI. Vous devez également disposer d'une connection internet.

```
git clone https://github.com/Oza94/pyduino
cd pyduino
npm i
```

## Lancement

Assurez vous que :

 * Les Arduino sont correctement branchés en USB
 * Les port série dans le fichier `index.js` correspondent bien aux Arduino SlapMachine/WeatherSensors
 
Lancez simplement `node index` et ouvrez votre navigateur à la page [http://localhost:8080](http://localhost:8080) !
