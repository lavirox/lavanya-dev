const SUPABASE_URL = 'https://uwayfesxnspreclmsotg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YXlmZXN4bnNwcmVjbG1zb3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjQzMTcsImV4cCI6MjA2NjA0MDMxN30.1wd_w4yYuyoOXCTOfj0-_xyN4oZNx31bk_wFQPAC4aQ';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadMessages() {
    const { data: messages, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7);
    
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