// Équipes présentes dans le tirage
export const teams = ['PAU', 'TRE', 'BRE', 'AAA', 'BBB', 'CCC'];
// Mot de passe de connexion, qui sera communiqué aux équipes
export const passwordChecker = (password, team) => password.length >= team.length;
// Nombre d'équipes par poules
export const poulesConfig = [3, 3];
