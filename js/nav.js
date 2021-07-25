"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Change view to show story submission form */

function navSubmitClick(evt) {
  if(currentUser === undefined) {
    alert("Please log in to submit a story.");
  } else {
    console.debug("submitClick", evt);
    hidePageComponents();
    $submitForm.show();
  }
}

$navSubmit.on("click", navSubmitClick);


/** Change view to show user's favorite stories */

function navFavsClick() {
  if(currentUser === undefined) {
    alert("Please log in to view your favorites.");
  } else {
    console.debug("navFavsList");
    hidePageComponents();
    putFavoritesOnPage();  
  }
  
}

$navFavList.on("click", navFavsClick)


/** Change view to show user's submitted stories */

function navUserStoriesClick() {
  if(currentUser === undefined) {
    alert("Please log in to see your submitted stories.");
  } else {
    console.debug("navUserStoriesClick");
    hidePageComponents();
    putUserStoriesOnPage();
  }
  
}

$navUserList.on("click", navUserStoriesClick);