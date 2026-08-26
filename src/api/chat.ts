import { supabase } from '@/supabaseClient'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const chatApi = {
  async send(messages: ChatMessage[]): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ content: string; error?: string }>('chat', {
      body: { messages },
    })
    if (error) throw error
    if (!data || data.error) throw new Error(data?.error ?? 'No response from chat')
    return data.content
  },
}
