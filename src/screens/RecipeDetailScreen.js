import { Platform } from 'react-native';
import RecipeDetailMobile from './RecipeDetailMobile';
import RecipeDetailWeb from './RecipeDetailWeb';

export default Platform.OS === 'web' ? RecipeDetailWeb : RecipeDetailMobile;
