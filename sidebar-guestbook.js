import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

async function loadMessages() {
    const { data: messages, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    const messagesList = document.getElementById('sidebar-messages');
    messagesList.innerHTML = '';

    messages.forEach(message => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${message.avatar_url}" alt="${message.username}" class="mini-avatar">
            <span class="message-content">${message.message}</span>
        `;
        messagesList.appendChild(li);
    });
}

// Listen for new messages
supabase
    .channel('guestbook_entries')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'guestbook_entries' }, 
        () => loadMessages()
    )
    .subscribe();

// Initial load
loadMessages();