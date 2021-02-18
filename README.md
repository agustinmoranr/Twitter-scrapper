# Twitter-scraper

Proyecto para extarer tweets utilizando el endpoint the ***Streaming*** que provee twitter y almacenarlos en mongoDB. 

Más información en [Twitter-API](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/introduction).

**¡Qué tal!**

En este proyecto podrás aprender a:
- Utilizar **needle** (un cliente para peticiones http que soporta peticiones de tipo *streaming*)
- Crear las reglas de busqueda para filtar los tweets que sean de tu interés, y añadirlas a tu cuenta de desarrollador de twitter.
- Crear un esquema de datos para MongoDB utiliazndo **Mongoose**
- Añadir la logica necesaria para almacenar cada tweet encontrado en una base de datos como **MongoDB**.
- Hacer deployment de este script en **Heroku**

Tecnologías usadas:
- Node JS
- Needle
- MongoDB
- Mongoose

Para utilizar el proyecto:
- Deberas crear una cuenta de desarrollador en twitter y obtener tu **Bearer-Token** para poder hacer peticiones HTTP a la Twitter-API. Sigue los pasos en [Twitter Developer Account](https://developer.twitter.com/en/apply-for-access).
- Crear un cluster en **MongoDB** y obtener la URI de conexión de tu cluster.

Una vez tengas tus credenciales. Crea un archivo **.env** y añadelas como lo muestra el archivo *.env-example*

¡Todo listo!

Ahora ejecuta

**npm install** para instalar las dependencias del proyecto.

**npm run start** para ejecutar el proyecto.

*(Cada vez que se reciba un tweet, se mostrará en la consola, y se almacenara en tu base de datos en MongoDB)*
