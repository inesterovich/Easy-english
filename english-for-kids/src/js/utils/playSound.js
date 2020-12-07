export default function playSound(currentCard) {
    const { audio } = currentCard;

    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}
