import { useState } from 'react';

import './Footer.css';
import './Random.css';
import './SeeMore.css';
import './Quotes.css';
import './Author.css';
import './Main.css';

function Random(props) {
	return (
		<button id='random' onClick={props.trigger}>
			<span>random</span>
			<i class='material-icons material-icons-outlined icons'>sync</i>
		</button>
	);
}

function SeeMore(props) {
	return (
		<div class={props.seeMoreAnimation} id='see-more' onClick={props.trigger}>
			<span id='name'>{props.state.author}</span>
			<span id='tags'>{props.state.genre}</span>
			<span id='arrow'><i class='material-icons material-icons-outlined icons'>arrow_right_alt</i></span>
		</div>
	);
}

var index = 0;

function Quotes(props) {
	index = 0;

	const quotes_list = props.quotes.map((x) => {
		index++;
		return (<div class={(index === 1) ? ((props.quotes.length === 1) ? 'quote-reveal' : 'quote-reveal' ) : 'quote hidden'} key={x}>{x}</div>);
	})

	return (
		<div id='quote-container'> 
			{quotes_list}
		</div>
	);
}

function Author(props) {
	return (
		<div id='title'> 
			{props.author}
		</div>
	);
}

function Footer() {
	return (
		<footer> 
			Created by&nbsp;<a href='https://github.com/josejovian' title='Jose Jovian'>josejovian</a>&nbsp;-&nbsp;<a href='https://devchallenges.io/' title='Dev Challenges'>devChallenges.io</a>
		</footer>
	);
}

var quotes = [];
var initialized = 0;
var seeMoreAnimation;

function App() {

	const [state, setState] = useState({
		title: '',
		author: '',
		genre: '',
		quotes: []
	})

	async function getData(url) {
		// https://github.com/mdn/js-examples/blob/master/promises-test/index.html

		let prom = new Promise(function(reso, reje) {
			let req = new XMLHttpRequest();
			req.open('GET', url);
			req.onload = function() {
				if (req.status === 200) {
					reso(req.response);
				} else {
					reje(new Error('Data could not be obtained. Error code: ' + req.statusText));
				}
			};
			req.send();
		});
		
		return prom;
	}

	async function getRandomQuote() {
		return await getData('https://quote-garden.herokuapp.com/api/v3/quotes/random');
	}

	async function getQuotesFromAuthor(author) {
		return await getData('https://quote-garden.herokuapp.com/api/v3/quotes?author=' + (author));
	}

	function allowScroll() {
		if(document.getElementById('html') !== null)
			document.getElementById('html').className = 'scrollable';
		else if(document.getElementById('multiple') !== null)
			document.getElementById('multiple').className = 'scrollable';
	}

	function disallowScroll() {
		if(document.getElementById('html') !== null)
			document.getElementById('html').className = '';
		else if(document.getElementById('multiple') !== null)
			document.getElementById('multiple').className = '';
	}

	async function setQuote() {
		if(document.getElementById('see-more') !== null && !document.getElementById('see-more').className.includes('hidden')) {
			document.getElementById('see-more').className = ('fade-out');
		}
		
		disallowScroll();
		if(document.getElementById('title') !== null) {
			document.getElementById('title').className = 'fade-out';
		}

		timedHide();
		var quoteObject = JSON.parse(await getRandomQuote());
		initialized++;

		let quoteText = quoteObject.data[0]['quoteText'];
		let quoteAuthor = quoteObject.data[0]['quoteAuthor'];
		let quoteGenre = quoteObject.data[0]['quoteGenre'];

		quotes.splice(0, quotes.length);
		quotes.push(quoteText);

		document.getElementsByTagName('html').className = '';
		setState({...state, title: '', author: quoteAuthor, genre: quoteGenre, quotes: quotes});
		if(document.getElementById('multiple') !== null) {
			document.getElementById('multiple').id = 'html';
		}
		document.getElementById('see-more').className = ('fade-in ');
		allowScroll();
	}

	async function setQuotesFromAuthor(author) {
		
		allowScroll();
		document.getElementById('see-more').className = ('fade-out');
		
		index = 0;
		var quotesObject = JSON.parse(await getQuotesFromAuthor(author));
		for(var i = 0; i < quotesObject.data.length; i++) {
			let quoteText = quotesObject.data[i]['quoteText'];
			if(!quotes.includes(quoteText)) {
				quotes.push(quoteText);
			}
			setState({...state, title: author, quotes: quotes});

			if(quotesObject.data.length > 1 && document.getElementById('html') !== null) {
				document.getElementById('html').id = 'multiple';
			}			
		}

		document.getElementById('see-more').className = ('fade-in ' + (state.title !== '') ? 'hidden' : '');
		document.getElementById('title').className = ('fade-in');
		timedReveal();
	}

	async function timedHide() {
		disallowScroll();

		if(document.getElementsByClassName('quote') === null)
			return;

		var arr = Array.prototype.slice.call( document.getElementsByClassName('quote-reveal') );

		let j = 0, limit = Math.max(20, state.quotes.length);

		while(j < limit) {
			try {
				let pro = await new Promise((reso, reje) => {
					function process() {
						if(j >= arr.length) {
							reje();
						} else {
							arr[j].className = 'quote-hide';
							reso();
						}
						j++;
					}
					setTimeout(() => process(), 100);
				})
			} catch(e) {
				console.log(e);
			}
		}

		if(document.getElementById('title') !== null)
			document.getElementById('title').className = '';
	}

	async function timedReveal() {
		var arr = Array.prototype.slice.call( document.getElementsByClassName('quote') );

		let j = 0, limit = Math.max(10, arr.length);

		while(j < limit) {
			try {
				let pro = await new Promise((reso, reje) => {
					function process() {
						if(j >= arr.length) {
							reje();
						} else if(j > 0) {
							arr[j].className = 'quote-reveal';
							reso();
						} else {
							reje();
						}
						j++;
					}
					setTimeout(() => process(), 100);
				});
			} catch(e) {
				console.log(e);
			}
		}

		document.getElementById('title').className = '';
	}	

	if(initialized === 0) {
		setQuote();
	}

	return (
		<div className='App'>
			<Random trigger={() => setQuote()}/>
			<Author author={state.title}/>
			<Quotes quotes={state.quotes}/>
			<SeeMore class={seeMoreAnimation} state={state} trigger={() => {
				setQuotesFromAuthor(state.author);
			}}/>
			<Footer />
		</div>
	);
}

export default App;
