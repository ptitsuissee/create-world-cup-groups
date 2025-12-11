// Configuration du compte administrateur
export const ADMIN_CONFIG = {
  email: 'suppmatchdrawpro@outlook.com',
  name: 'LesSuisse',
  // Pour la démo, le mot de passe sera stocké ici
  // En production avec Supabase, ceci sera géré par la base de données
  password: 'MatchDraw2024Admin!',
};

export const isAdminAccount = (email: string): boolean => {
  return email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
};
