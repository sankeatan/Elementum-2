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
    lobbyname: string,
    players: number,
    spectators: number,
    ping: number
  }
}

export default shared;
