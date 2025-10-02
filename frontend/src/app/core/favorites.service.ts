import { Injectable } from "@angular/core";
import { LocationOption } from "@app/models/data.model";

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'myFavorites';

  getFavorites(): LocationOption[]{
    const favJson = localStorage.getItem(this.STORAGE_KEY);
    return favJson ? JSON.parse(favJson) : [];
  }

  private saveFavorites(favorites: LocationOption[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
  }

  addFavorites(item: LocationOption): void {
    const favorites = this.getFavorites();
    if (!favorites.some(fav => fav.stopPlaceRef === item.stopPlaceRef)) {
      this.saveFavorites([... favorites, item]);
    }
  }

  removeFavorites(stopPlaceRef: string): void {
    const favorites = this.getFavorites();
    const updatedFavs = favorites.filter(fav=> fav.stopPlaceRef !== stopPlaceRef);
    this.saveFavorites(updatedFavs)
  }

  isFavorite(stopPlaceRef: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.stopPlaceRef === stopPlaceRef);
  }
}

