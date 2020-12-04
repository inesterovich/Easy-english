import { dictionary } from '../lang/langs'
import Card from './card'
import create from '../utils/create';
import * as randFunc from '../utils/unicRandomGenerator';

export class EnglishApp {

    constructor(base) {
        this.base = base;
        this.dictionary = dictionary;
        this.mode = 'Train';

        this.playGame = {
            status: null,
            button: null,
            index: 0,
            counter: 0,
        }
    }

    clickHandler = (event) => {
        if (event.target.closest('.switch__wrapper')) {
            event.stopPropagation();
            const switchInput = event.target.closest('.switch__wrapper').childNodes[1].childNodes[0];
            const trainLabel = event.target.closest('.switch__wrapper').childNodes[0];
            const playLabel = event.target.closest('.switch__wrapper').childNodes[2];
            if (switchInput.checked) {
                switchInput.checked = false;
                trainLabel.classList.toggle('active');
                playLabel.classList.toggle('active');
                this.mode = 'Train';
                const isCategory = this.layout.main.dataset.isCategory === 'true';
                if (isCategory) {

                    const page = this.layout.main.dataset.categoryName;
                    this.setTrainLayout(page)
                }

            } else {
                switchInput.checked = true;
                trainLabel.classList.toggle('active');
                playLabel.classList.toggle('active');
                this.mode = 'Play';
                const isCategory = this.layout.main.dataset.isCategory === 'true';
                if (isCategory) {

                    const page = this.layout.main.dataset.categoryName;
                    this.setPlayLayout(page)
                }

            }


        } else {
            event.preventDefault()
        };
        if (event.target.dataset.btn === 'menu') {
            event.target.classList.toggle('active');
            this.layout.modals.classList.toggle('active')
        } else {
            this.layout.modals.classList.remove('active');
            this.menuBtn.classList.remove('active');
        }

        if (event.target.closest('.category__card')) {
            const target = event.target.closest('.category__card');
            const categoryName = target.dataset.category;
            this.generateLayout(categoryName);
        }

        if (event.target.closest('.menu__item__link')) {
            const linkName = event.target.closest('.menu__item__link').innerText;
            const linkList = event.target.closest('.menu__list').childNodes;
            linkList.forEach(node => {
                node.childNodes[0].classList.remove('active');
            })

            event.target.closest('.menu__item__link').classList.add('active');
            this.generateLayout(linkName);
        }

        if (this.mode === 'Train') {
            if (event.target.closest('.card')) {
                if (event.target.classList.contains('rotate__card')) {
                    let frontSide = event.target.closest('.front__side');
                    let backSide = event.target.closest('.card').childNodes[1];
                    frontSide.classList.toggle('active');
                    backSide.classList.toggle('active');
                } else {
                    const cardId = event.target.closest('.card').id;
                    const currentCard = this.categoryCards.find(card => card.id == cardId);

                    const frontSide = event.target.closest('.front__side');

                    if (frontSide) {
                        this.playSound(currentCard)
                    }


                }


            }


        } else if (this.mode === 'Play') {
            event.preventDefault();
            event.stopPropagation();
            this.playGameHandler(event);
        }






    }

    mouseLeaveHandler = (event) => {
        const card = event.target.closest('.card');
        const backSide = event.target;
        const frontSide = card.childNodes[0];

        frontSide.classList.toggle('active');
        backSide.classList.toggle('active');
    }

    generateLayout(page) {


        if (page === 'main' || page === 'Main') {

            let mainContent = this.layout.main.childNodes;
            while (mainContent.length > 0) {
                mainContent.forEach(item => item.remove());
            }

            this.categoriesHtml = [];
            this.categories.forEach((categoryName, index) => {
                const src = this.categoriesSrc[index];

                const categoryCard = create('div', 'category__card',
                    [create('img', 'category__img', null, null, ['src', src]),
                    create('h3', 'category__name', `${categoryName}`, null)]
                    , null, ['category', `${categoryName}`]);
                this.layout.main.appendChild(categoryCard);
                this.categoriesHtml.push(categoryCard)
            })


        }

        if (this.categories.includes(page)) {

            this.mode === 'Train' ? this.setTrainLayout(page) : this.setPlayLayout(page)
        }

        if (this.categories.includes(page)) {
            this.layout.main.dataset.isCategory = 'true';
            this.layout.main.dataset.categoryName = page;
        } else {
            this.layout.main.dataset.isCategory = 'false';
        }

    }

    playSound(currentCard) {
        const audio = currentCard.audio;

        if (audio) {
            audio.currentTime = 0;
            audio.play();
        } else {
            console.log('sound not found');
        }
    }


    setTrainLayout(page) {
        let mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach(item => item.remove());
        }

        const categoryArray = this.dictionary.filter(wordObj => wordObj.category === page)
            .map(item => new Card(item, this.base).init())

        const randArray = Array.from(randFunc.generateSet(0, categoryArray.length))
            .map(item => categoryArray[item]);

        this.categoryCards = randArray;




        this.categoryCards.forEach(card => {
            card.html.classList.remove('play');
            this.layout.main.appendChild(card.html);
            const backSide = card.html.childNodes[1];
            backSide.addEventListener('mouseleave', this.mouseLeaveHandler);
        })

    }

    setPlayLayout(page) {

        let mainContent = this.layout.main.childNodes;
        while (mainContent.length > 0) {
            mainContent.forEach(item => item.remove());
        }

        const categoryArray = this.dictionary.filter(wordObj => wordObj.category === page)
            .map(item => new Card(item, this.base).init())

        const randArray = Array.from(randFunc.generateSet(0, categoryArray.length))
            .map(item => categoryArray[item]);

        this.categoryCards = randArray;


        this.categoryCards.forEach(card => {
            card.html.classList.add('play')
            this.layout.main.appendChild(card.html);
        })

        this.playGame.coins = create('div', 'coin__section');
        this.layout.main.prepend(this.playGame.coins);

        this.playGame.button = create('button', 'game__button', 'Start Game', this.layout.main);


    }

    playGameHandler = (event) => {
        debugger;
        if (event.target === this.playGame.button) {
            if (this.playGame.status === null) {
                this.playGame.status = 'game';
                this.playGame.button.innerText = 'Repeat';
                this.playGame.randNumbers = Array.from(randFunc.generateSet(0, this.categoryCards.length));
                this.playGame.counter = this.categoryCards.length
            }
            const i = this.playGame.randNumbers[this.playGame.index];

            this.playGame.currentCard = this.categoryCards[i];
            this.playSound(this.playGame.currentCard);

        }

        if (event.target.closest('.card') && this.playGame.status) {
            const cardId = Number(event.target.closest('.card').id);
            const correctCardId = Number(this.playGame.currentCard.id);

            if (cardId === correctCardId) {
                if (this.playGame.index + 1 < this.categoryCards.length) {
                    this.playGame.index += 1;
                    const audioUrl = `./audio/correctcard.mp3`;
                    const audio = new Audio(audioUrl);
                    this.playGame.currentCard.html.classList.add('disabled')
                    const i = this.playGame.randNumbers[this.playGame.index];
                    this.playGame.currentCard = this.categoryCards[i];
                    // Promise.race пойдёт мне ?
                    audio.play();
                    audio.addEventListener('ended',
                        () => this.playSound(this.playGame.currentCard));
                    const coinSrc = './icons/dollartrue.svg'
                    const fullCoin = create('img', 'coin', null, this.playGame.coins, ['src', `${coinSrc}`])


                } else {

                    this.playGame.currentCard.html.classList.add('disabled')
                    const result = this.categoryCards.length === this.playGame.counter ? 'Success' : 'Failure';
                    this.playGame.button.remove();
                    if (result === 'Success') {
                        const src = './icons/succesgame.png'
                        const window = create('div', 'window', create('div', 'result',
                            [
                                create('img', 'result__img', null, null, ['src', `${src}`]),
                                create('p', 'result__text', 'You won the game!')
                            ]
                        ));
                        this.layout.body.appendChild(window);
                        const audioSrc = './audio/sucessgame.mp3';
                        const audio = new Audio(audioSrc);
                        audio.play();

                        audio.addEventListener('ended', () => {
                            window.remove();
                            this.playGame.index = 0;
                            this.playGame.status = null;
                            this.playGame.counter = null;
                            this.generateLayout('main');
                        })




                    } else if (result === 'Failure') {
                        const mistakes = this.categoryCards.length - this.playGame.counter;
                        const src = './icons/failedgame.png';
                        const ending = mistakes > 1 ? 'es' : 'e'
                        const window = create('div', 'window', create('div', 'result',
                            [
                                create('img', 'result__img', null, null, ['src', `${src}`]),
                                create('p', 'result__text', `Sorry, you lost.
                                 You made ${mistakes} mistak${ending}.`)
                            ]
                        ));
                        this.layout.body.appendChild(window);

                        const audioSrc = './audio/failedgame.mp3';
                        const audio = new Audio(audioSrc);
                        audio.play();

                        audio.addEventListener('ended', () => {
                            window.remove();
                            this.playGame.index = 0;
                            this.playGame.status = null;
                            this.playGame.counter = null;
                            this.generateLayout('main');
                        })

                    }
                }


            } else if (cardId !== correctCardId) {
                this.playGame.counter -= 1;
                const audioUrl = `./audio/wrongcard.mp3`;
                const audio = new Audio(audioUrl);
                audio.play();
                const coinSrc = './icons/dollarfalse.svg'
                const blankCoin = create('img', 'coin', null, this.playGame.coins, ['src', `${coinSrc}`])
            }

        }

    }


    generateSkin() {

        this.layout =
        {
            body: null,
            header: null,
            main: null,
            footer: null,
            modals: null,
        };

        this.layout.body = document.querySelector('body');
        this.menuBtn = create('div', 'menu__button',
            [create('span', '', ''), create('span', '', ''), create('span', '', '')], null, ['btn', 'menu'])

        let modeButton = create('div', 'switch__wrapper', [
            create('label', 'switcher__label switcher__train active', 'Train', null, ['for', 'checkbox']),
            create('div', 'switcher',
                [
                    create('input', 'switcher__checkbox', null, null, ['type', 'checkbox'], ['id', 'checkbox']),
                    create('span', 'switch__button',)
                ]),
            create('label', 'switcher__label switcher__play', 'Play', null, ['for', 'checkbox']),
        ], null);


        this.layout.header = create('header', 'header',
            [this.menuBtn, create('h1', 'title', 'Easy English'), modeButton], null);
        this.layout.main = create('main', 'main', null, null);
        const footerContent = [
            create('div', 'copyright__wrapper', [create('p', 'copyright', '&copy 2020, Ilya Nesterovich'),
            create('a', 'github__link', 'Visit GitHub', null,
                ['href', 'https://github.com/inesterovich/']),]),
            create('div', 'rsschool__link__wrapper',
                create('a', 'rsschool__link', create('img', 'rsschool__logo', null, null, ['src', './icons/rs_school_js.svg']), null, ['href', 'https://rs.school/js/']))]
        this.layout.footer = create('footer', 'footer', footerContent, null);

        this.categories = new Set();
        this.categoriesSrc = [];

        dictionary.forEach(wordObj => {
            if (!this.categories.has(wordObj.category)) {
                this.categories.add(wordObj.category);
                this.categoriesSrc.push(wordObj.src);
            }


        })


        this.categories = Array.from(this.categories);

        const menuLinks = ['Main', ...this.categories, 'Stats'];
        const menuLinksHtml = [];
        menuLinks.forEach(linkName => {
            const linkItem = create('li', 'menu__item', create('a', 'menu__item__link', linkName, null, ['href', './']), null);
            menuLinksHtml.push(linkItem);
        })

        menuLinksHtml[0].childNodes[0].classList.add('active')




        this.layout.modals = create('section', 'modals',
            create('nav', 'main__nav', create('ul', 'menu__list',
                menuLinksHtml, null), null)
            , null);

        let pageWrapper = create('div', 'page__wrapper',
            [this.layout.header, this.layout.main, this.layout.footer, this.layout.modals],
            null);



        this.layout.body.prepend(pageWrapper)

        return this;
    }




    init() {
        this.generateSkin();
        this.generateLayout('main')
        document.addEventListener('click', this.clickHandler);

        return this;

    }



}