"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }

}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, story) {

    // make POST request to the API
    const res = await axios({
      url: `${BASE_URL}/stories`,
      data: {
        token: user.loginToken,
        story: {
          title: story.title,
          author: story.author,
          url: story.url
        }
      },
      method: 'POST'
    });

    // API request returns a new story instance, store it in the storyList
    this.stories.push(new Story(res.data.story));

  }

  /** Deletes story data from API, and removes from storyList
   * - 
   * Returns message from API of successful deletion
   */
  async deleteStory(id) {

    this.stories = this.stories.filter((s) => s.storyId !== id);

    const res = await axios({
      url: `${BASE_URL}/stories/${id}`,
      data: {
        token: currentUser.loginToken,
      },
      method: 'DELETE'
    });

    console.log(res.data.message);

  }
}



/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories

    //takes the array of story info returned from the API,
    //take the info, turn it into a story object, then put it back into the array
    // do the same for ownstories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }


  /** "Favorite" a story
   * Send favorite request to API
   * Get the story back from the API,
   * then push it onto the favorites list
   * 
   */
  async addFavorite(storyId) {

    const res = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
      data: { token: currentUser.loginToken },
      method: "POST"
    });

    console.log(res.data.story);

    const resTwo = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "GET"
    })

    this.favorites.push(new Story(resTwo.data.story));
  }

  /**
   * get the users favorite stories
   * PARAMS adds to query string
   * DATA fills in form data
   */

  async clearFavorites() {
    for (let fav of this.favorites) {
      const res = await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${fav.storyId}`,
        data: { token: currentUser.loginToken },
        method: "DELETE"
      });

      console.log(res.data.message);

      this.favorites = [];
    }
  }


  /**
   * Get a users favorite stories
   * 
   */
  async getFavorites() {
    const res = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      params: { token: currentUser.loginToken },
      method: "GET"
    });

    // API query returns an array of objects
    // an array of Stories is needed, so the result 
    // so map is used
    const favList = res.data.user.favorites;
    const favStoryList = favList.map(s => new Story(s));

    return favStoryList;
  }

  /** Remove a story from favorites
   * Remove from favorites list
   * Make a DELETE request to the API
   * 
   * 
   */
  async removeFavorite(id) {

    this.favorites = this.favorites.filter((story) => story.storyId !== id);

    const res = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${id}`,
      data: { token: currentUser.loginToken },
      method: "DELETE"
    });

    console.log(res.data.message);
  }

  /** Return Boolean if sotry is in the favorites list
   *  Used when generating story markups
   *  to determine whether a story needs to be shown as a favorite or not
   *
   */
  isFavorite(story) {
    if(currentUser !== undefined) {
      return this.favorites.some((s) => {
        return s.storyId === story.storyId; //make sure to return 
      });
    }
  }

  /** returns a list of user stories
   * to populate the my stories list
   * 
   * 
   */
  async getUserStories() {

    const res = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      params: { token: currentUser.loginToken },
      method: "GET"
    });

    // get the array of story objects from the API
    const userStories = res.data.user.stories;
    // convert it into an array of Stories
    const userStoryList = userStories.map(s => new Story(s));

    return userStoryList;

  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    console.debug("LoginViaStoresCredentials");
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

}
