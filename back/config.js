// Équipes présentes dans le tirage
export const teams = ['PAU', 'TRE', 'BER']
// Nombre d'équipes par poules
export const poulesConfig = [3]
// Nombre de problèmes
export const problemes = 8
// Port d'écoute du serveur
export const port = 8081

/**
 * Fonction qui vérifie le mot de passe d'une équipe
 *
 * @param {String} password mot de passe à vérifier
 * @param {String} team trigramme de l'équipe
 * @returns {boolean} true si le mot de passe est bon, false sinon
 */
export const passwordChecker = (password, team) => password.length >= team.length
