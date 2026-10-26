/* Contact form → Telegram relay
   The bot token never lives in this file: the form posts to a small relay
   (server/telegram-relay) that holds the token and forwards to Telegram.
   Set the relay URL in the form's data-endpoint attribute. */

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');
const FALLBACK_EMAIL = 'admin@wstory.kr';

function showStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle('is-error', !!isError);
  statusEl.classList.add('show');
}

function setSending(sending) {
  submitBtn.disabled = sending;
  submitBtn.firstChild.textContent = sending ? '전송 중… ' : '문의 보내기 ';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.classList.remove('show');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const endpoint = form.dataset.endpoint;
  if (!endpoint) {
    showStatus(`온라인 접수를 준비 중입니다. ${FALLBACK_EMAIL} 로 메일 주시면 빠르게 답변 드리겠습니다.`, true);
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.subject = form.subject.options[form.subject.selectedIndex].text;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  setSending(true);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showStatus('문의가 정상적으로 접수되었습니다. 빠르게 답변 드리겠습니다.');
    form.reset();
  } catch (err) {
    showStatus(`전송에 실패했습니다. 잠시 후 다시 시도하시거나 ${FALLBACK_EMAIL} 로 메일 주세요.`, true);
  } finally {
    clearTimeout(timer);
    setSending(false);
  }
});
