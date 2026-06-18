import { initTracker } from "../tracker";

(async () => {
  while (!Spicetify?.Player || !Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  initTracker();
  Spicetify.showNotification("Listening Insights Tracker Active!");
})();

