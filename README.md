
# Black Hole

Hi everybody,

This is a project I started last year with the hope of creating an amazing online multiplayer web application game that will become very famous and loved by everyone. However, as I made progress, I realized that creating such a game requires a lot of knowledge and hard work, and it’s nearly impossible for a solo developer to handle every aspect of the game, like graphics, backend, and frontend. Anyway, I tried my best, and the result is what you see in the demo.

Now, because I’m a student majoring in a subject not entirely related to this field, I don’t have much time to continue developing the game. So, I decided to make the source code public. Maybe someone will like it, continue its development.

If I get a chance, I'll write documentation, but everything is simple and easy to understand—or at least that’s what I think.

Feel free to use it; I’ll be very happy to see if it helps anyone.

Before I forget, here is my donation link. If you like the idea, you can donate to me.

Bitcoin:
bc1qzgyrkn2kfhkj9q7et7mkld59vstx9d2dzqc3za

Eth:
0x5Ce6e769EEECeC291933fe0E61776d7b33b3D93e

Usdt(trc20):
TA8VBkrehiWG87cichmkG2BiqZGKRvGgTE

## Demo
[demo.webm](https://github.com/iammazyar/blackhole/assets/102358714/0bd2404b-778f-43c1-b7b5-e7a81a8c9875)

Each player's character is represented by a galaxy that moves toward the direction of the mouse. Each galaxy has a power property that allows it to absorb other galaxies, depending on the power ratio and the distance between the galaxies. Power is determined by the galaxy's radius and the total playtime (more playtime increases power).

The number of arms a galaxy has also increases with playtime (e.g., 2 arms after 2 minutes, 3 arms after 5 minutes, etc.).

In the center of the field, there is a black hole that absorbs nearby stars and mass. If you get close to the black hole, the screen zooms out to show the entire game field, but your mass and radius decrease over time until the black hole absorbs you. Conversely, the farther you are from the black hole, the more your mass and radius grow, but the screen zooms in to show only your immediate surroundings.


## Installation And Running Locally

just pull the repo and run these commands
```bash
  npm run install
  npm run dev
```
    
## Appendix

** For the graphics of the galaxy i used the shader code made by Fabrice Neyret, and cusomized it for myself.

https://www.shadertoy.com/view/Xsl3zX

