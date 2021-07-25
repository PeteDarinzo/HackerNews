"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();


  return $(`
      <li id="${story.storyId}">
      ${(currentUser !== undefined && currentUser.isFavorite(story)) ? '<span class="star favorite">&#9733</span>' : '<span class="star">&#9734</span>'}
        <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}</a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function generateUserStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <button class="delete">DEL</button>
        ${currentUser.isFavorite(story) ? '<span class="star favorite">&#9733</span>' : '<span class="star">&#9734</span>'}
        <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}</a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function generateFavStoryMarkup(story) {

  const hostName = story.getHostName();

  return $(`
  <li id="${story.storyId}">
  <span class="star favorite">&#9733</span>
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);
}

async function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $userStoriesList.empty();

  const stories = await currentUser.getUserStories();

  for(let story of stories) {
    const $story = generateUserStoryMarkup(story);
    $userStoriesList.append($story); 
  }

  $userStoriesList.show();
}

async function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favStoriesList.empty();

  const favs = await currentUser.getFavorites();

  for(let fav of favs) {
    const $story = generateFavStoryMarkup(fav);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/** Handle story submission from submit form */

async function submitStory(evt) {

  evt.preventDefault();

  console.debug("submitStory");

  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  const story = {
    title,
    author,
    url
  }

  await storyList.addStory(currentUser, story);

  putStoriesOnPage();

  $("#submit-title").val('');
  $("#submit-author").val('');
  $("#submit-url").val('');
  
  $submitForm.hide();

}

$submitForm.on("submit", submitStory);

async function favoriteStory(evt) {

  console.debug("favoriteStory", evt);

  currentUser.addFavorite();
}


/**
 * Handle click on "favorite" star
 * 
 * Star HTML adapted from:
 * https://www.html.am/html-codes/character-codes/html-star-code.cfm
 */

$body.on("click", ".star", (evt) => {
  const $button = $(evt.target);

  const $story = $(evt.target.closest("LI"));
  const $storyId = $story.attr("id");

  // toggle favorite star
  if($button.hasClass("favorite")) {
    $button.removeClass("favorite")
    $button.html("&#9734");
    currentUser.removeFavorite($storyId);
  } else {
    $button.addClass("favorite");
    $button.html("&#9733");
    currentUser.addFavorite($storyId);
  }
});


/** Handle delete button click on the user submitted story list */

$body.on("click", ".delete", (evt) => {
  const $button = $(evt.target);

  const $story = $($button.closest("LI"));
  const $storyId = $story.attr("id");
  storyList.deleteStory($storyId); // delete story from storiesList, and the API
  $story.remove(); // remove from the user story DOM
});