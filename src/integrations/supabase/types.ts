export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean
          created_at: string
          examples: string | null
          id: string
          name: string
          quota: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          examples?: string | null
          id?: string
          name: string
          quota?: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          examples?: string | null
          id?: string
          name?: string
          quota?: number
          sort_order?: number
        }
        Relationships: []
      }
      guests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          guest_name: string
          contact: string | null
          coming: boolean
          attendees_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          guest_name: string
          contact?: string | null
          coming: boolean
          attendees_count: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          guest_name?: string
          contact?: string | null
          coming?: boolean
          attendees_count?: number
        }
        Relationships: []
      }
      rsvp_items: {
        Row: {
          brings_utensils: boolean | null
          category_id: string | null
          created_at: string
          diet_tags: string[] | null
          id: string
          item_title: string | null
          servings: number | null
          updated_at: string
          warm_needed: boolean | null
          warm_notes: string | null
          guest_id: string
        }
        Insert: {
          brings_utensils?: boolean | null
          category_id?: string | null
          created_at?: string
          diet_tags?: string[] | null
          id?: string
          item_title?: string | null
          servings?: number | null
          updated_at?: string
          warm_needed?: boolean | null
          warm_notes?: string | null
          guest_id: string
        }
        Update: {
          brings_utensils?: boolean | null
          category_id?: string | null
          created_at?: string
          diet_tags?: string[] | null
          id?: string
          item_title?: string | null
          servings?: number | null
          updated_at?: string
          warm_needed?: boolean | null
          warm_notes?: string | null
          guest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_items_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
