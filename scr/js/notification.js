  const notificationDelay = 2000; // Tempo de atraso em milissegundos (2 segundos)
  var notificationTimeout;
  
  function openNotification(notificationID) {
    const notification = document.getElementById(notificationID);
    notification.classList.remove('hidden');
    notificationTimeout = setTimeout(() => {closeNotification(notification)}, notificationDelay);
}

function openNotificationNotClose(notificationID) {
  const notification = document.getElementById(notificationID);
  notification.classList.remove('hidden');
}

  function closeNotification(notification) {
    notification.classList.add('hidden');
    clearTimeout(notificationTimeout);
  }

  function handleClickCloseButton(button) {
    const notificationID = button.getAttribute('data-notification-id')
    const notificantion = document.getElementById(notificationID)
    notificantion.classList.add('hidden')
}
