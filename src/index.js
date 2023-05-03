import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const input = document.querySelector('.search-form-input');
const btnSearch = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
let gallerySimpleLightbox = new SimpleLightbox('.gallery a');
const perPage = 40;
let pageNumber = 1;

btnLoadMore.style.display = 'none';

const fetchImages = async (inputValue, pageNumber) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=35945685-9eb735ebb3da774bd49e978fd&q=${inputValue}&orientation=horizontal&safesearch=true&image_type=photo&per_page=40&page=${pageNumber}`
    );
    return await response.data;
  } catch (error) {
    console.error(error);
  }
};

btnSearch.addEventListener('submit', searchImages);
async function searchImages(e) {
  try {
    e.preventDefault();
    cleanGallery();
    const trimmedValue = input.value.trim();
    if (trimmedValue !== '') {
      const foundData = await fetchImages(trimmedValue, pageNumber);
      if (foundData.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderImageList(foundData.hits);
        Notiflix.Notify.success(
          `Hooray! We found ${foundData.totalHits} images.`
        );
        if (foundData.hits.length + 1 <= perPage) {
          btnLoadMore.style.display = 'none';
        } else {
          btnLoadMore.style.display = 'block';
        }
        gallerySimpleLightbox.refresh();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

btnLoadMore.addEventListener('click', loadMore);
async function loadMore() {
  try {
    pageNumber += 1;
    const trimmedValue = input.value.trim();
    btnLoadMore.style.display = 'none';
    const foundData = await fetchImages(trimmedValue, pageNumber);
    let totalPages = foundData.totalHits / perPage;
    if (pageNumber >= totalPages) {
      renderImageList(foundData.hits);
      gallerySimpleLightbox.refresh();
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      renderImageList(foundData.hits);
      gallerySimpleLightbox.refresh();
      btnLoadMore.style.display = 'block';
    }
  } catch (error) {
    console.log(error);
  }
}

function renderImageList(images) {
  console.log(images, 'images');
  const markup = images
    .map(image => {
      console.log('img', image);
      return `<div class="photo-card">
       <a href="${image.largeImageURL}"><img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/></a>
        <div class="info">
           <p class="info-item">
    <b>Likes</b> <span class="info-item-api"> ${image.likes} </span>
</p>
            <p class="info-item">
                <b>Views</b> <span class="info-item-api">${image.views}</span>  
            </p>
            <p class="info-item">
                <b>Comments</b> <span class="info-item-api">${image.comments}</span>  
            </p>
            <p class="info-item">
                <b>Downloads</b> <span class="info-item-api">${image.downloads}</span> 
            </p>
        </div>
    </div>`;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function cleanGallery() {
  gallery.innerHTML = '';
  pageNumber = 1;
  btnLoadMore.style.display = 'none';
}
