const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let current_user = null;

async function signInWithGithub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) {
    alert("Error signing in: " + error.message);
  }
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error signing out: " + error.message);
  }
}

function showSignedInState() {
  document.getElementById("signed_out").classList.add("hidden");
  document.getElementById("signed_in").classList.remove("hidden");
  document.getElementById("message_form").classList.remove("hidden");
  document.getElementById("user_name").textContent =
    current_user.user_metadata.user_name;
  document.getElementById("user_avatar").src =
    current_user.user_metadata.avatar_url;
}

function showSignedOutState() {
  document.getElementById("signed_out").classList.remove("hidden");
  document.getElementById("signed_in").classList.add("hidden");
  document.getElementById("message_form").classList.add("hidden");
}

async function checkIfSignedIn() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  current_user = user;
  if (user) {
    showSignedInState();
  } else {
    showSignedOutState();
  }

  loadMessages();

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      current_user = session.user;
      showSignedInState();
    } else {
      current_user = null;
      showSignedOutState();
    }
  });

  // listening for msgs
  supabase
    .channel("guestbook_entries")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "guestbook_entries" },
      (payload) => {
        loadMessages(); // Only reload all messages for consistency
      },
    )
    .subscribe();
}

async function submitMessage() {
  const messageInput = document.getElementById("message_input");
  const message = messageInput.value.trim();

  if (!message) {
    alert("please enter a message!");
    return;
  }

  const submitButton = document.getElementById("submit-button");
  submitButton.disabled = true;
  submitButton.textContent = "posting...";

  const { error } = await supabase.from("guestbook_entries").insert([
    {
      user_id: current_user.id,
      username: current_user.user_metadata.user_name,
      avatar_url: current_user.user_metadata.avatar_url,
      message: message,
    },
  ]);

  if (error) {
    alert("error posting message: " + error.message);
  } else {
    messageInput.value = "";
    loadMessages();
  }

  submitButton.disabled = false;
  submitButton.textContent = "post message";
}

async function loadMessages() {
  const { data: messages, error } = await supabase
    .from("guestbook_entries")
    .select("*")
    .order("created_at", { ascending: true });

  const messagesList = document.getElementById("messages_list");

  if (error) {
    messagesList.innerHTML = '<li class="loading">error loading messages</li>';
    return;
  }

  if (messages.length === 0) {
    messagesList.innerHTML =
      '<li class="loading">no messages yet. be the first!</li>';
    return;
  }

  messagesList.innerHTML = "";
  messages.forEach((message) => {
    addMessageToList(message);
  });
}

function addMessageToList(message) {
  const messagesList = document.getElementById("messages_list");

  if (
    messagesList.innerHTML.includes("no messages yet") ||
    messagesList.innerHTML.includes("loading")
  ) {
    messagesList.innerHTML = "";
  }

  const messageEl = document.createElement("li");
  messageEl.className = "message-item";

  const date = new Date(message.created_at).toLocaleString();

  messageEl.innerHTML = `
        <div class="message-header">
            <span class="message-username">${message.username}</span>
            <span class="message-date">${date}</span>
        </div>
        <div class="message-content" style="font-style: normal;">${message.message}</div>
    `;

  messagesList.insertBefore(messageEl, messagesList.firstChild);
}

window.signInWithGithub = signInWithGithub;
window.signOut = signOut;

// Initialization
checkIfSignedIn();
