// Configuración centralizada de Supabase
const SUPABASE_URL = 'https://zskmxfxafxgbdohcxvgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KTUD6IxK7g2zSZIJr-vnPg_ww0z2nlZ';

// Cambiamos el nombre de la variable para evitar conflictos con la librería global
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Configuración de Supabase cargada correctamente.");

/**
 * Función universal para guardar puntajes
 * @param {string} game - Nombre del juego ('snake', 'tetris', etc.)
 * @param {string} player - Nombre del usuario
 * @param {number} score - Puntos obtenidos
 * @param {number} time - Segundos jugados
 */
async function saveGameScore(game, player, score, time) {
    const { data, error } = await _supabase
        .from('mini_games_leaderboard')
        .insert([
            { 
                game_name: game, 
                player_name: player, 
                score: score, 
                time_seconds: time 
            }
        ]);

    if (error) {
        console.error("❌ Error al guardar en Supabase:", error.message);
        return false;
    }
    console.log("🏆 ¡Puntaje guardado con éxito!", data);
    return true;
}