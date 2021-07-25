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
 * Returns the markup for the story, 
 * depending on if it for the main page, favorites page, or user-submitted stories
 */

function generateStoryMarkup(story) {

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

  const favs = await currentUser.getFavoriteStories();

  for(let fav of favs) {
    const $story = generateFavStoryMarkup(fav);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
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

  $("#submit-title").val('');
  $("#submit-author").val('');
  $("#submit-url").val('');
}

$submitForm.on("submit", submitStory);




/**
 * Handle click on "favorite" star
 * 
 * Star HTML adapted from:
 * https://www.html.am/html-codes/character-codes/html-star-code.cfm
 */

async function toggleFavorite(evt) {
  
  if(currentUser === undefined) {
    alert("Please log in to start liking stories.");
  } else {
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
  }

}

// favorite toggle click event handler
$body.on("click", ".star", toggleFavorite);



/**
 * Handle story deletion (only for user submitted stories)
 */

async function deleteUserStory(evt) {

  evt.preventDefault();

  console.debug("deleteStory");

  const $button = $(evt.target);
  const $story = $($button.closest("LI"));
  const $storyId = $story.attr("id");

  await storyList.deleteStory(currentUser, $storyId); // delete story from storiesList, and the API

  $story.remove(); // remove from the user story DOM
}

// delete button click event handler
$body.on("click", ".delete", deleteUserStory);