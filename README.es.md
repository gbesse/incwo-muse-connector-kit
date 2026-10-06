# Kit de conector incwo para Muse

[Français](README.md) · [English](README.en.md)

Este kit ofrece un puente HTTP **de solo lectura** y una descripción OpenAPI para proponer a [Muse](https://www.meta.com/en-gb/help/artificial-intelligence/1687253048996149/) un conector personalizado de incwo. El puente solo expone listas de contactos y empresas. Utiliza las rutas XML documentadas por la [API de incwo](https://www.incwo.com/site/developer) y devuelve el XML en un objeto JSON. El repositorio no guarda contraseñas ni tokens.

## Iniciar

Cree tres archivos privados que contengan, respectivamente, un token largo para el puente, el usuario API de incwo y su contraseña API. Asigne permisos 600 a cada archivo. Configure CONNECTOR_TOKEN_FILE, INCWO_USER_FILE, INCWO_PASSWORD_FILE e INCWO_API_BASE_URL con la URL API de su cuenta incwo. Ejecute npm start; de forma predeterminada el servicio solo escucha en 127.0.0.1:8787. Ejecute npm test para las comprobaciones locales.

Para una conexión remota, coloque el puente detrás de un servidor HTTPS autenticado, sustituya la URL de ejemplo en openapi.yaml y pida a Muse que cree un conector personalizado con esta descripción y su documentación. Entregue el token mediante el almacén de credenciales de Muse, nunca en la conversación. El kit está pensado para una sola cuenta incwo por despliegue; instale una instancia aislada por cuenta.

Las pruebas demuestran el rechazo de escrituras y rutas no autorizadas con un servidor simulado. No demuestran la autenticación en una cuenta incwo real, la importación de OpenAPI por Muse ni la aprobación del conector por Meta. Empiece con una lectura y compruebe los permisos reales antes de utilizarlo.

Licencia MIT.
