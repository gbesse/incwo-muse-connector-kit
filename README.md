# Kit de connecteur incwo pour Muse

[English](README.en.md) · [Español](README.es.md)

Ce kit fournit une passerelle HTTP **en lecture seule** et une description OpenAPI pour proposer à [Muse](https://www.meta.com/en-gb/help/artificial-intelligence/1687253048996149/) un connecteur personnalisé incwo. La passerelle expose seulement les listes de contacts et d'entreprises. Elle utilise les routes XML documentées par [l'API incwo](https://www.incwo.com/site/developer) et renvoie l'XML dans une enveloppe JSON. Aucun mot de passe ni jeton n'est conservé dans le dépôt.

## Démarrer

Créez trois fichiers privés contenant respectivement un jeton long pour la passerelle, l'identifiant API incwo et le mot de passe API incwo. Donnez à chaque fichier les permissions 600. Configurez CONNECTOR_TOKEN_FILE, INCWO_USER_FILE, INCWO_PASSWORD_FILE et INCWO_API_BASE_URL avec l'URL API propre à votre dossier incwo. Lancez npm start ; le service écoute par défaut uniquement sur 127.0.0.1:8787. Exécutez npm test pour les essais locaux.

Pour une connexion distante, placez la passerelle derrière un serveur HTTPS authentifié, remplacez l'URL d'exemple dans openapi.yaml, puis demandez à Muse de créer un connecteur personnalisé à partir de cette description et de sa documentation. Communiquez le jeton dans le magasin d'identifiants de Muse, jamais dans la conversation. Le kit est conçu pour un seul dossier incwo par déploiement ; déployez une instance isolée par dossier.

Les tests prouvent le refus des écritures et des routes non autorisées sur un serveur simulé. Ils ne prouvent ni l'authentification sur un compte incwo réel, ni l'import du fichier OpenAPI par Muse, ni l'approbation du connecteur par Meta. Commencez par une lecture et vérifiez les droits réels avant tout usage.

Licence MIT.
