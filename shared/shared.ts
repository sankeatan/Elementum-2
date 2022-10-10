namespace shared {
  export type CardType = ElementName | "wand" | "HIDDEN"
  export type PlayerSlot = 'player1' | 'player2'
  export type ElementName = 'fire' | 'water' | 'earth' | 'lightning' | 'nether'
  export type ActionSlot = 'attack1' | 'attack2' | 'defend'

  export class ElementCluster {
      public fire: boolean = false
      public water: boolean = false
      public earth: boolean = false
      public lightning: boolean = false
      public nether: boolean = false
  }

  export interface PlayerAction {
    attack1: CardType | null
    attack2: CardType | null
    defend: CardType | null
  }

  export interface LobbyInfo {
    lobby_id: number,
    lobby_name: string,
    players: number,
    spectators: number,
  }

  export interface Token {
    str: string,
    expiration: string,
    player_name: string,
    player_id: number,
  }
}

export default shared;
