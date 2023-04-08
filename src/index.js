import Notiflix, { Notify } from "notiflix";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const inputDOM = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more')
loadBtn.style.display = 'none';

let totalHits = 0;
let page = 1;
let lastPage = 0;

const PHOTOS_URL = 'https://pixabay.com/api/'
const API_KEY = '34960396-ee79eba7e6dca12e9fa7bf6c6';

const searchOptions = {
key: API_KEY,
q: '',
imageType: 'photo',
orientation: 'horizontal',
SFW: 'true',
page: 1,
per_page: 40,
};

const fetchPhotos = async (page = 1) => {
    searchOptions.page = page;
    try {
        const response = await axios.get(PHOTOS_URL, {
            params: searchOptions,
        })
        console.log(response)
        
    const photos = await response.data.hits;

    totalHits = response.data.totalHits;
        
    lastPage = Math.ceil(totalHits / 40);
    return photos;
    } catch (error) {
    Notiflix.Notify.failure(`Sorry, there are no imaages matching your search query. Please try again.`)
    }
};

const renderPhotos = (photos) => {
    const markupPhotos = photos
        .map(photo => {
            return `
    <div class="photo-card">
    <a class="" href="${photo.largeImageURL}">
  <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${photo.likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${photo.views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${photo.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${photo.downloads}
    </p>
  </div>
  </div>
`
        }).join('');
    
    gallery.insertAdjacentHTML('beforeend', markupPhotos);
    simpleLightBox = new SimpleLightbox('.gallery a', {captions: false,}).refresh();
}

searchForm.addEventListener('submit', async event => {
    event.preventDefault();

    const textInput = inputDOM.value;
    searchOptions.q = textInput;

    page = 1;

    const fetchedPhotos = await fetchPhotos();
    if (totalHits > 0) {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`)
        gallery.innerHTML = '';
        loadBtn.style.display = 'block';
        renderPhotos(fetchedPhotos);
    } else if (page === lastPage) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else if (totalHits === 0) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info("Sorry, there are no images matching your search query. Please try again.")
        gallery.innerHTML = '';
    }
});

loadBtn.addEventListener('click', async event => {
    page += 1;
    const fetchedPhotos = await fetchPhotos(page);
    renderPhotos(fetchedPhotos);
    if (page === lastPage) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results.");
    } else {
        loadBtn.style.display = 'block';
    }

    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
});