const connectedDevice = document.getElementById('connectedDevice');
  const disconnectedDevice = document.getElementById('disconnectedDevice');
  const closeNotificationButtons = document.querySelectorAll('.closeNotification');
  let notificationTimeout;
  const notificationDelay = 2000; // Tempo de atraso em milissegundos (2 segundos)

  function notifyConnected() {
    connectedDevice.classList.remove('hidden');
    
    notificationTimeout = setTimeout(closeConnectedNotification, notificationDelay);
  }

  function notifyDisconnected() {
    disconnectedDevice.classList.remove('hidden');

    notificationTimeout = setTimeout(closeDisconnectedNotification, notificationDelay);
  }

  function closeConnectedNotification() {
    connectedDevice.classList.add('hidden');
    clearTimeout(notificationTimeout);
  }

  function closeDisconnectedNotification() {
    disconnectedDevice.classList.add('hidden');
    clearTimeout(notificationTimeout);
  }

  closeNotificationButtons.forEach(button => {
    button.addEventListener('click', notifyClose);
  });

  function notifyClose() {
    connectedDevice.classList.add('hidden');
    disconnectedDevice.classList.add('hidden');
    clearTimeout(notificationTimeout);
  }