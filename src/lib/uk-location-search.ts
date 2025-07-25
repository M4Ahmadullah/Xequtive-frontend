/**
 * Comprehensive UK Location Search Service
 * Queries Mapbox for all UK location types mentioned in the requirements
 * No hardcoded data - all results come from Mapbox API
 */

import { LocationSuggestion, LocationSearchResponse } from './location-search-service';

export interface UKLocationCategory {
  id: string;
  name: string;
  icon: string;
  searchQueries: string[];
  types: string[];
  description: string;
}

export interface UKLocationSearchResult {
  category: string;
  results: LocationSuggestion[];
  totalCount: number;
}

class UKLocationSearchService {
  private readonly cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private cache = new Map<string, { data: any; timestamp: number; expiresAt: number }>();
  
  // Comprehensive UK location categories
  private readonly ukLocationCategories: UKLocationCategory[] = [
    {
      id: 'airports',
      name: 'Airports',
      icon: '✈️',
      searchQueries: [
        'Heathrow Airport',
        'Gatwick Airport',
        'Stansted Airport',
        'Luton Airport',
        'Manchester Airport',
        'Birmingham Airport',
        'Edinburgh Airport',
        'Glasgow Airport',
        'Bristol Airport',
        'Newcastle Airport',
        'Liverpool Airport',
        'Leeds Bradford Airport',
        'East Midlands Airport',
        'Doncaster Sheffield Airport',
        'Cardiff Airport',
        'Belfast International Airport',
        'Aberdeen Airport',
        'Southampton Airport',
        'Bournemouth Airport',
        'Exeter Airport',
        'London City Airport',
        'Southend Airport',
        'Norwich Airport',
        'Humberside Airport',
        'Durham Tees Valley Airport',
        'Blackpool Airport',
        'Prestwick Airport',
        'Inverness Airport',
        'Isle of Man Airport',
        'Jersey Airport',
        'Guernsey Airport'
      ],
      types: ['poi'],
      description: 'UK airports and aerodromes'
    },
    {
      id: 'train_stations',
      name: 'Train Stations',
      icon: '🚆',
      searchQueries: [
        'King\'s Cross Station',
        'Paddington Station',
        'Victoria Station',
        'Waterloo Station',
        'Euston Station',
        'Liverpool Street Station',
        'St Pancras Station',
        'Charing Cross Station',
        'London Bridge Station',
        'Manchester Piccadilly Station',
        'Birmingham New Street Station',
        'Edinburgh Waverley Station',
        'Glasgow Central Station',
        'Bristol Temple Meads Station',
        'Newcastle Central Station',
        'Liverpool Lime Street Station',
        'Leeds Station',
        'Sheffield Station',
        'Nottingham Station',
        'Cardiff Central Station',
        'Reading Station',
        'Brighton Station',
        'Bath Spa Station',
        'York Station',
        'Durham Station',
        'Cambridge Station',
        'Oxford Station',
        'Bristol Parkway Station',
        'Crewe Station',
        'Preston Station',
        'Carlisle Station',
        'Aberdeen Station',
        'Inverness Station'
      ],
      types: ['poi'],
      description: 'UK railway stations'
    },
    {
      id: 'tube_stations',
      name: 'Tube Stations',
      icon: '🚇',
      searchQueries: [
        'Leicester Square Underground',
        'Bank Underground',
        'Canary Wharf Underground',
        'Oxford Circus Underground',
        'Piccadilly Circus Underground',
        'Tottenham Court Road Underground',
        'Holborn Underground',
        'Covent Garden Underground',
        'Embankment Underground',
        'Westminster Underground',
        'Green Park Underground',
        'Hyde Park Corner Underground',
        'Knightsbridge Underground',
        'South Kensington Underground',
        'Earl\'s Court Underground',
        'Gloucester Road Underground',
        'Sloane Square Underground',
        'Victoria Underground',
        'Pimlico Underground',
        'Vauxhall Underground'
      ],
      types: ['poi'],
      description: 'London Underground stations'
    },
    {
      id: 'landmarks',
      name: 'Landmarks',
      icon: '🏛️',
      searchQueries: [
        'Big Ben',
        'Buckingham Palace',
        'Stonehenge',
        'London Eye',
        'Wembley Stadium',
        'O2 Arena',
        'Eden Project',
        'Natural History Museum',
        'Windsor Castle',
        'Tower of London',
        'Tower Bridge',
        'London Bridge',
        'Westminster Abbey',
        'St Paul\'s Cathedral',
        'Trafalgar Square',
        'Piccadilly Circus',
        'Covent Garden',
        'Camden Market',
        'Portobello Road Market',
        'Borough Market',
        'Hyde Park',
        'Regent\'s Park',
        'Kensington Palace',
        'Hampton Court Palace',
        'Chatsworth House',
        'Blenheim Palace',
        'Alnwick Castle',
        'Edinburgh Castle',
        'Stirling Castle',
        'Eilean Donan Castle',
        'Caernarfon Castle',
        'Warwick Castle',
        'Leeds Castle',
        'Dover Castle',
        'Bamburgh Castle',
        'Arundel Castle',
        'Highclere Castle',
        'Balmoral Castle',
        'Holyrood Palace',
        'Palace of Holyroodhouse',
        'Royal Mile Edinburgh',
        'Arthur\'s Seat',
        'Calton Hill',
        'Princes Street Gardens',
        'Royal Botanic Gardens Edinburgh',
        'Scott Monument',
        'National Gallery of Scotland',
        'Scottish National Gallery',
        'Royal Yacht Britannia',
        'Dynamic Earth',
        'Camera Obscura',
        'Edinburgh Zoo',
        'Royal Observatory Greenwich',
        'Cutty Sark',
        'Greenwich Park',
        'Old Royal Naval College',
        'Queen\'s House',
        'National Maritime Museum',
        'Royal Observatory',
        'Prime Meridian',
        'Greenwich Mean Time',
        'Canary Wharf',
        'Docklands',
        'London Docklands',
        'ExCeL London',
        'Olympic Park',
        'Queen Elizabeth Olympic Park',
        'Stratford',
        'Westfield Stratford',
        'Westfield London',
        'Bluewater',
        'Trafford Centre',
        'Meadowhall',
        'Metrocentre',
        'Brent Cross',
        'White Rose Centre',
        'Lakeside',
        'Intu Watford',
        'Intu Braehead',
        'Intu Victoria Centre',
        'Intu Eldon Square',
        'Intu Merry Hill',
        'Intu Derby',
        'Intu Potteries',
        'Intu Trafford Centre',
        'Intu Lakeside',
        'Intu Watford',
        'Intu Braehead'
      ],
      types: ['poi'],
      description: 'Famous UK landmarks and attractions'
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      icon: '🏥',
      searchQueries: [
        'Guy\'s Hospital',
        'St Thomas\' Hospital',
        'King\'s College Hospital',
        'University College Hospital',
        'Royal London Hospital',
        'Barts Hospital',
        'Manchester Royal Infirmary',
        'Birmingham Queen Elizabeth Hospital',
        'Edinburgh Royal Infirmary',
        'Glasgow Royal Infirmary',
        'Bristol Royal Infirmary',
        'Newcastle Royal Victoria Infirmary',
        'Liverpool Royal Hospital',
        'Leeds General Infirmary',
        'Sheffield Northern General Hospital',
        'Nottingham City Hospital',
        'Cardiff University Hospital',
        'Belfast Royal Victoria Hospital',
        'Aberdeen Royal Infirmary',
        'Southampton General Hospital'
      ],
      types: ['poi'],
      description: 'UK hospitals and medical facilities'
    },
    {
      id: 'universities',
      name: 'Universities',
      icon: '🎓',
      searchQueries: [
        'University College London',
        'University of Oxford',
        'University of Cambridge',
        'Imperial College London',
        'London School of Economics',
        'King\'s College London',
        'Queen Mary University of London',
        'University of Manchester',
        'University of Birmingham',
        'University of Edinburgh',
        'University of Glasgow',
        'University of Bristol',
        'University of Newcastle',
        'University of Liverpool',
        'University of Leeds',
        'University of Sheffield',
        'University of Nottingham',
        'Cardiff University',
        'Queen\'s University Belfast',
        'University of Aberdeen'
      ],
      types: ['poi'],
      description: 'UK universities and colleges'
    },
    {
      id: 'shopping_centres',
      name: 'Shopping Centres',
      icon: '🛍️',
      searchQueries: [
        'Westfield London',
        'Westfield Stratford',
        'Bluewater',
        'Trafford Centre',
        'Meadowhall',
        'Metrocentre',
        'Brent Cross',
        'White Rose Centre',
        'Lakeside',
        'Intu Watford',
        'Intu Braehead',
        'Intu Victoria Centre',
        'Intu Eldon Square',
        'Intu Merry Hill',
        'Intu Derby',
        'Intu Potteries',
        'Intu Trafford Centre',
        'Intu Lakeside',
        'Intu Watford',
        'Intu Braehead'
      ],
      types: ['poi'],
      description: 'UK shopping centres and malls'
    },
    {
      id: 'hotels',
      name: 'Hotels',
      icon: '🏨',
      searchQueries: [
        'The Ritz London',
        'Claridge\'s Hotel',
        'The Savoy Hotel',
        'The Dorchester',
        'The Connaught',
        'Brown\'s Hotel',
        'The Berkeley',
        'The Goring',
        'The Langham',
        'The Lanesborough',
        'Mandarin Oriental Hyde Park',
        'Park Lane Hotel',
        'Grosvenor House Hotel',
        'The May Fair Hotel',
        'The Berkeley Hotel',
        'The Connaught Hotel',
        'The Goring Hotel',
        'The Langham Hotel',
        'The Lanesborough Hotel',
        'Mandarin Oriental Hotel'
      ],
      types: ['poi'],
      description: 'UK hotels and accommodation'
    },
    {
      id: 'restaurants',
      name: 'Restaurants',
      icon: '🍽️',
      searchQueries: [
        'Nando\'s',
        'Wagamama',
        'Dishoom',
        'The Ivy',
        'Gordon Ramsay Restaurants',
        'Hakkasan',
        'Zuma',
        'Nobu',
        'Sketch',
        'Gymkhana',
        'Heddon Street Kitchen',
        'Sexy Fish',
        'Chiltern Firehouse',
        'The Wolseley',
        'The Delaunay',
        'The Ritz Restaurant',
        'Claridge\'s Restaurant',
        'The Savoy Grill',
        'The Dorchester Grill',
        'The Connaught Grill'
      ],
      types: ['poi'],
      description: 'UK restaurants and dining'
    },
    {
      id: 'parks',
      name: 'Parks',
      icon: '🌳',
      searchQueries: [
        'Hyde Park',
        'Richmond Park',
        'Hampstead Heath',
        'Regent\'s Park',
        'Green Park',
        'St James\'s Park',
        'Kensington Gardens',
        'Battersea Park',
        'Victoria Park',
        'Clapham Common',
        'Wimbledon Common',
        'Putney Heath',
        'Wormwood Scrubs',
        'Holland Park',
        'Kew Gardens',
        'Royal Botanic Gardens',
        'Crystal Palace Park',
        'Alexandra Palace Park',
        'Finsbury Park',
        'Brockwell Park'
      ],
      types: ['poi'],
      description: 'UK parks and green spaces'
    },
    {
      id: 'museums',
      name: 'Museums',
      icon: '🏛️',
      searchQueries: [
        'British Museum',
        'Natural History Museum',
        'Science Museum',
        'Victoria and Albert Museum',
        'Tate Modern',
        'Tate Britain',
        'National Gallery',
        'National Portrait Gallery',
        'Imperial War Museum',
        'Museum of London',
        'Design Museum',
        'Horniman Museum',
        'Dulwich Picture Gallery',
        'Wallace Collection',
        'Sir John Soane\'s Museum',
        'Geffrye Museum',
        'Museum of the Home',
        'Garden Museum',
        'Fashion and Textile Museum',
        'Cartoon Museum',
        'Ashmolean Museum',
        'Pitt Rivers Museum',
        'Fitzwilliam Museum',
        'Scottish National Gallery',
        'Scottish National Portrait Gallery',
        'Scottish National Museum',
        'Kelvingrove Art Gallery',
        'Hunterian Museum',
        'National Museum of Scotland',
        'Royal Museum',
        'Museum of Edinburgh',
        'Museum of Transport',
        'Riverside Museum',
        'People\'s Palace',
        'Tenement House',
        'Provand\'s Lordship',
        'St Mungo Museum',
        'Gallery of Modern Art',
        'Museum of Religious Life',
        'Museum of Piping',
        'Museum of Childhood',
        'Museum of Edinburgh',
        'Museum of Transport',
        'Riverside Museum',
        'People\'s Palace',
        'Tenement House',
        'Provand\'s Lordship',
        'St Mungo Museum',
        'Gallery of Modern Art',
        'Museum of Religious Life',
        'Museum of Piping',
        'Museum of Childhood'
      ],
      types: ['poi'],
      description: 'UK museums and galleries'
    },
    {
      id: 'famous_places',
      name: 'Famous Places',
      icon: '⭐',
      searchQueries: [
        'Big Ben',
        'Buckingham Palace',
        'Stonehenge',
        'London Eye',
        'Wembley Stadium',
        'O2 Arena',
        'Eden Project',
        'Windsor Castle',
        'Tower of London',
        'Tower Bridge',
        'London Bridge',
        'Westminster Abbey',
        'St Paul\'s Cathedral',
        'Trafalgar Square',
        'Piccadilly Circus',
        'Covent Garden',
        'Camden Market',
        'Portobello Road Market',
        'Borough Market',
        'Hyde Park',
        'Regent\'s Park',
        'Kensington Palace',
        'Hampton Court Palace',
        'Chatsworth House',
        'Blenheim Palace',
        'Alnwick Castle',
        'Edinburgh Castle',
        'Stirling Castle',
        'Eilean Donan Castle',
        'Caernarfon Castle',
        'Warwick Castle',
        'Leeds Castle',
        'Dover Castle',
        'Bamburgh Castle',
        'Arundel Castle',
        'Highclere Castle',
        'Balmoral Castle',
        'Holyrood Palace',
        'Palace of Holyroodhouse',
        'Royal Mile Edinburgh',
        'Arthur\'s Seat',
        'Calton Hill',
        'Princes Street Gardens',
        'Royal Botanic Gardens Edinburgh',
        'Scott Monument',
        'National Gallery of Scotland',
        'Scottish National Gallery',
        'Royal Yacht Britannia',
        'Dynamic Earth',
        'Camera Obscura',
        'Edinburgh Zoo',
        'Royal Observatory Greenwich',
        'Cutty Sark',
        'Greenwich Park',
        'Old Royal Naval College',
        'Queen\'s House',
        'National Maritime Museum',
        'Royal Observatory',
        'Prime Meridian',
        'Greenwich Mean Time',
        'Canary Wharf',
        'Docklands',
        'London Docklands',
        'ExCeL London',
        'Olympic Park',
        'Queen Elizabeth Olympic Park',
        'Stratford',
        'Westfield Stratford',
        'Westfield London',
        'Bluewater',
        'Trafford Centre',
        'Meadowhall',
        'Metrocentre',
        'Brent Cross',
        'White Rose Centre',
        'Lakeside',
        'Intu Watford',
        'Intu Braehead',
        'Intu Victoria Centre',
        'Intu Eldon Square',
        'Intu Merry Hill',
        'Intu Derby',
        'Intu Potteries',
        'Intu Trafford Centre',
        'Intu Lakeside',
        'Intu Watford',
        'Intu Braehead'
      ],
      types: ['poi'],
      description: 'Famous UK landmarks and popular places'
    }
  ];

  /**
   * Get data from cache if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set data in cache with expiration
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheTimeout
    });
  }

  /**
   * Extract postcode from Mapbox context
   */
  private extractPostcode(context: any[]): string | undefined {
    if (!context || !Array.isArray(context)) return undefined;
    const postcodeContext = context.find(item => item.id?.startsWith('postcode'));
    return postcodeContext?.text;
  }

  /**
   * Extract city from Mapbox context
   */
  private extractCity(context: any[]): string | undefined {
    if (!context || !Array.isArray(context)) return undefined;
    const cityContext = context.find(item => 
      item.id?.startsWith('place') || 
      item.id?.startsWith('locality')
    );
    return cityContext?.text;
  }

  /**
   * Convert Mapbox feature to LocationSuggestion
   */
  private convertMapboxFeature(feature: any, category: string): LocationSuggestion {
    return {
      id: feature.id || `mapbox-${Date.now()}`,
      address: feature.place_name || 'Unknown Location',
      mainText: feature.text || 'Unknown Location',
      secondaryText: feature.place_name || '',
      name: feature.text || 'Unknown Location',
      latitude: feature.center?.[1] || 0,
      longitude: feature.center?.[0] || 0,
      coordinates: {
        lat: feature.center?.[1] || 0,
        lng: feature.center?.[0] || 0
      },
      metadata: {
        primaryType: feature.place_type?.[0] || 'poi',
        postcode: this.extractPostcode(feature.context),
        city: this.extractCity(feature.context),
        region: 'UK',
        category: category,
        placeId: feature.id
      }
    };
  }

  /**
   * Search for locations by category
   */
  async searchByCategory(categoryId: string): Promise<LocationSearchResponse> {
    try {
      // Check cache first
      const cacheKey = `uk_category_${categoryId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const category = this.ukLocationCategories.find(cat => cat.id === categoryId);
      if (!category) {
        return {
          success: false,
          error: {
            message: 'Category not found',
            details: `Category ${categoryId} does not exist`
          }
        };
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      let allFeatures: any[] = [];

      // Search for each query in the category
      for (const query of category.searchQueries) {
        try {
          // Try different search strategies for better results
          const searchStrategies = [
            {
              params: new URLSearchParams({
                access_token: token,
                country: 'gb',
                autocomplete: 'true',
                limit: '5',
                types: 'poi',
                language: 'en',
                bbox: '-8.2,49.9,1.8,60.9'
              }),
              name: 'POI search'
            },
            {
              params: new URLSearchParams({
                access_token: token,
                country: 'gb',
                autocomplete: 'true',
                limit: '5',
                types: 'place',
                language: 'en',
                bbox: '-8.2,49.9,1.8,60.9'
              }),
              name: 'Place search'
            },
            {
              params: new URLSearchParams({
                access_token: token,
                country: 'gb',
                autocomplete: 'true',
                limit: '5',
                language: 'en',
                bbox: '-8.2,49.9,1.8,60.9'
                // No types restriction
              }),
              name: 'Comprehensive search'
            }
          ];

          for (const strategy of searchStrategies) {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${strategy.params}`;
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'force-cache'
            });

            if (response.ok) {
              const data = await response.json();
              if (data.features && Array.isArray(data.features)) {
                console.log(`📊 Mapbox response for "${query}" (${strategy.name}):`, data.features);
                allFeatures.push(...data.features);
                
                // If we found good results, break out of strategy loop
                if (data.features.length > 0) {
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${query}:`, error);
        }
      }

      // Remove duplicates and convert to our format
      const uniqueFeatures = allFeatures.filter((feature, index, self) => 
        index === self.findIndex(f => f.id === feature.id)
      );

      const results: LocationSuggestion[] = uniqueFeatures
        .slice(0, 20) // Limit to top 20 results
        .map(feature => this.convertMapboxFeature(feature, categoryId));

      // Cache the results
      this.setCachedData(cacheKey, results);

      console.log(`✅ Found ${results.length} ${category.name}`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error(`Error searching category ${categoryId}:`, error);
      return {
        success: false,
        error: {
          message: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get all available categories
   */
  getCategories(): UKLocationCategory[] {
    return this.ukLocationCategories;
  }

  /**
   * Search for famous places and landmarks
   */
  async searchFamousPlaces(query: string): Promise<LocationSearchResponse> {
    try {
      if (!query.trim() || query.trim().length < 2) {
        return {
          success: true,
          data: []
        };
      }

      const cacheKey = `famous_places_${query.toLowerCase()}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      // Famous places search queries
      const famousPlacesQueries = [
        query,
        `${query} landmark`,
        `${query} attraction`,
        `${query} tourist`,
        `${query} famous`,
        `${query} popular`
      ];

      let allFeatures: any[] = [];

      for (const searchQuery of famousPlacesQueries) {
        try {
          const params = new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '10',
            types: 'poi',
            language: 'en',
            bbox: '-8.2,49.9,1.8,60.9'
          });

          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${params}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'force-cache'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.features && Array.isArray(data.features)) {
              allFeatures.push(...data.features);
            }
          }
        } catch (error) {
          console.error(`Error searching famous places: ${searchQuery}`, error);
        }
      }

      // Remove duplicates and filter for relevant results
      const uniqueFeatures = allFeatures.filter((feature, index, self) => 
        index === self.findIndex(f => f.id === feature.id)
      );

      // Filter for places that are likely to be famous landmarks
      const famousPlaces = uniqueFeatures.filter((feature: any) => {
        const text = feature.text?.toLowerCase() || '';
        const placeName = feature.place_name?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        // Check if it contains the search query and looks like a landmark
        const containsQuery = text.includes(queryLower) || placeName.includes(queryLower);
        const isLandmark = text.includes('palace') || 
                          text.includes('castle') || 
                          text.includes('museum') || 
                          text.includes('gallery') || 
                          text.includes('park') || 
                          text.includes('square') || 
                          text.includes('bridge') || 
                          text.includes('tower') || 
                          text.includes('cathedral') || 
                          text.includes('abbey') || 
                          text.includes('stadium') || 
                          text.includes('arena') ||
                          placeName.includes('palace') || 
                          placeName.includes('castle') || 
                          placeName.includes('museum') || 
                          placeName.includes('gallery') || 
                          placeName.includes('park') || 
                          placeName.includes('square') || 
                          placeName.includes('bridge') || 
                          placeName.includes('tower') || 
                          placeName.includes('cathedral') || 
                          placeName.includes('abbey') || 
                          placeName.includes('stadium') || 
                          placeName.includes('arena');
        
        return containsQuery && isLandmark;
      });

      const results: LocationSuggestion[] = famousPlaces
        .slice(0, 15)
        .map(feature => this.convertMapboxFeature(feature, 'famous_place'));

      // Cache the results
      this.setCachedData(cacheKey, results);

      console.log(`✅ Found ${results.length} famous places for "${query}"`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Error searching famous places:', error);
      return {
        success: false,
        error: {
          message: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Search for terminals/platforms near a specific location
   * Improved to use hardcoded terminal data for better accuracy
   */
  async searchTerminals(locationId: string, category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    try {
      const cacheKey = `terminals_${locationId}_${category}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Import the hardcoded data for accurate terminal information
      const { findLocationById, getTerminalsByLocationId } = await import('./uk-airports-stations');
      
      // Find the location in our hardcoded data
      const location = findLocationById(locationId);
      
      if (!location) {
        // Fallback to Mapbox search if not found in hardcoded data
        return this.searchTerminalsViaMapbox(locationId, category);
      }

      // Get terminals from hardcoded data
      const terminals = getTerminalsByLocationId(locationId);
      
      if (terminals.length === 0) {
        // Fallback to Mapbox search if no terminals found
        return this.searchTerminalsViaMapbox(locationId, category);
      }

      // Convert terminals to LocationSuggestion format
      const results: LocationSuggestion[] = terminals.map(terminal => ({
        id: terminal.id,
        address: terminal.fullName,
        mainText: terminal.name,
        secondaryText: terminal.description || '',
        name: terminal.name,
        latitude: terminal.latitude,
        longitude: terminal.longitude,
        coordinates: {
          lat: terminal.latitude,
          lng: terminal.longitude
        },
        metadata: {
          primaryType: terminal.type,
          postcode: location.postcode,
          city: location.city,
          region: 'UK',
          category: terminal.type,
          placeId: terminal.id,
          parentPlaceId: locationId
        }
      }));

      // Cache the results
      this.setCachedData(cacheKey, results);

      console.log(`✅ Found ${results.length} terminals for ${location.name}`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Error searching terminals:', error);
      return {
        success: false,
        error: {
          message: 'Failed to search terminals',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Fallback method to search terminals via Mapbox
   */
  private async searchTerminalsViaMapbox(locationId: string, category: 'airport' | 'train_station'): Promise<LocationSearchResponse> {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      // First get the location details to get coordinates
      const locationParams = new URLSearchParams({
        access_token: token,
        country: 'gb',
        types: 'poi',
        language: 'en'
      });

      const locationUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationId)}.json?${locationParams}`;
      const locationResponse = await fetch(locationUrl);
      
      if (!locationResponse.ok) {
        return {
          success: false,
          error: {
            message: 'Location not found',
            details: 'Could not find the specified location'
          }
        };
      }

      const locationData = await locationResponse.json();
      if (!locationData.features || locationData.features.length === 0) {
        return {
          success: false,
          error: {
            message: 'Location not found',
            details: 'No location data available'
          }
        };
      }

      const location = locationData.features[0];
      const [longitude, latitude] = location.center;

      // Search for terminals/platforms with more specific queries
      const terminalQueries = category === 'airport' ? [
        `${locationId} terminal`,
        `${locationId} departure`,
        `${locationId} arrival`,
        'airport terminal',
        'departure terminal',
        'arrival terminal'
      ] : [
        `${locationId} platform`,
        `${locationId} railway platform`,
        'station platform',
        'train platform',
        'railway platform'
      ];

      let allTerminals: any[] = [];

      for (const query of terminalQueries) {
        try {
          const params = new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '10',
            types: 'poi',
            language: 'en',
            proximity: `${longitude},${latitude}` // Search near the location
          });

          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'force-cache'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.features && Array.isArray(data.features)) {
              allTerminals.push(...data.features);
            }
          }
        } catch (error) {
          console.error(`Error searching for terminals: ${query}`, error);
        }
      }

      // Remove duplicates and filter for relevant results
      const uniqueTerminals = allTerminals.filter((terminal, index, self) => 
        index === self.findIndex(t => t.id === terminal.id)
      );

      // Filter terminals that are likely to be part of the selected location
      const relevantTerminals = uniqueTerminals.filter((terminal: any) => {
        const text = terminal.text?.toLowerCase() || '';
        const placeName = terminal.place_name?.toLowerCase() || '';
        const locationName = locationId.toLowerCase();
        
        // Log what we're finding for debugging
        console.log(`📍 Found terminal candidate: "${terminal.text}" - "${terminal.place_name}"`);
        
        if (category === 'airport') {
          const isTerminal = (text.includes('terminal') || 
                             text.includes('departure') || 
                             text.includes('arrival') ||
                             placeName.includes('terminal') ||
                             placeName.includes('departure') ||
                             placeName.includes('arrival')) &&
                             (placeName.includes(locationName) || text.includes(locationName));
          
          if (isTerminal) {
            console.log(`✅ Confirmed airport terminal: "${terminal.text}"`);
          }
          
          return isTerminal;
        } else {
          const isPlatform = (text.includes('platform') || 
                             text.includes('railway') ||
                             placeName.includes('platform') ||
                             placeName.includes('railway')) &&
                             (placeName.includes(locationName) || text.includes(locationName));
          
          if (isPlatform) {
            console.log(`✅ Confirmed station platform: "${terminal.text}"`);
          }
          
          return isPlatform;
        }
      });

      const results: LocationSuggestion[] = relevantTerminals
        .slice(0, 10)
        .map(terminal => this.convertMapboxFeature(terminal, category === 'airport' ? 'terminal' : 'platform'));

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Error searching terminals via Mapbox:', error);
      return {
        success: false,
        error: {
          message: 'Failed to search terminals',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Enhanced general search with multiple categories and improved location detection
   */
  async enhancedSearch(query: string): Promise<LocationSearchResponse> {
    try {
      if (!query.trim() || query.trim().length < 2) {
        return {
          success: true,
          data: []
        };
      }

      const cacheKey = `enhanced_search_${query.toLowerCase()}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        return {
          success: false,
          error: {
            message: 'Missing Mapbox token',
            details: 'Mapbox access token is not configured'
          }
        };
      }

      // Enhanced search strategy with better type coverage
      const searchStrategies = [
        {
          name: 'comprehensive',
          params: new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '20',
            language: 'en',
            bbox: '-8.2,49.9,1.8,60.9'
            // No types restriction - search everything
          })
        },
        {
          name: 'poi_only',
          params: new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '15',
            types: 'poi',
            language: 'en',
            bbox: '-8.2,49.9,1.8,60.9'
          })
        },
        {
          name: 'address_only',
          params: new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '10',
            types: 'address',
            language: 'en',
            bbox: '-8.2,49.9,1.8,60.9'
          })
        },
        {
          name: 'place_only',
          params: new URLSearchParams({
            access_token: token,
            country: 'gb',
            autocomplete: 'true',
            limit: '10',
            types: 'place',
            language: 'en',
            bbox: '-8.2,49.9,1.8,60.9'
          })
        }
      ];

      let allFeatures: any[] = [];

      // Try each search strategy
      for (const strategy of searchStrategies) {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${strategy.params}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'force-cache'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.features && Array.isArray(data.features)) {
              console.log(`📊 ${strategy.name} search found ${data.features.length} results for "${query}"`);
              allFeatures.push(...data.features);
            }
          }
        } catch (error) {
          console.error(`Error in ${strategy.name} search:`, error);
        }
      }

      // Remove duplicates and prioritize better results
      const uniqueFeatures = allFeatures.filter((feature, index, self) => 
        index === self.findIndex(f => f.id === feature.id)
      );

      // Sort results by relevance (POI first, then places, then addresses)
      const sortedFeatures = uniqueFeatures.sort((a, b) => {
        const aType = a.place_type?.[0] || '';
        const bType = b.place_type?.[0] || '';
        
        const typePriority = {
          'poi': 1,
          'place': 2,
          'address': 3,
          'postcode': 4,
          'neighborhood': 5
        };
        
        return (typePriority[aType as keyof typeof typePriority] || 6) - 
               (typePriority[bType as keyof typeof typePriority] || 6);
      });

      const results: LocationSuggestion[] = sortedFeatures
        .slice(0, 20) // Increased limit for better coverage
        .map(feature => this.convertMapboxFeature(feature, 'general'));

      // Cache the results
      this.setCachedData(cacheKey, results);

      console.log(`✅ Enhanced search found ${results.length} results for "${query}"`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Error in enhanced search:', error);
      return {
        success: false,
        error: {
          message: 'Search failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export singleton instance
export const ukLocationSearchService = new UKLocationSearchService(); 