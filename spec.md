This is the initial spec for Digital Umbra, a single-player Web game inspired by board games.

This document may have ambiguities. Some of them are gameplay specifics that will need to be sorted out in playtesting. But if you have any questions about the rules or flow of the game, please address them before continuing with the design.

## Architecture

This should be based on the Vite/Svelte stack. This game is client-side only; there is no server that stores any data. The state needs to be persisted after client actions so that it can be played in a mobile browser that might reload it at any time.

The UI and architecture should be based off the sibling game Jacq's Quest; the repo for that is at /home/rob/repos/jackpot-dungeon. Please examine that codebase and CLAUDE.md for general layout practices.

## Theme

The theme of this game is that the player is a "runner": a hacker, infiltrating large organizations in a science fiction near-future. The player's actions are technically illegal, but working against oppressive control; their motives might be either noble or selfish. Their methods will include both technical hacking and social deception.

Through the game, the player will accrue two resources: Cash, and Secrets. Cash is used to purchase upgrades and services in between runs. Secrets are victory points. The player intends to trade in the secrets for their ultimate goal--riches, an exit visa, freedom, etc.

The aesthetic of the Runner should be bold cyberpunk. The aesthetic of the targets will vary between drab corporate, slick corporate, and oppressive authoritarian.

## Gameplay

The game takes place in two alternating phases: the Run phase, and the Downtime phase.

### Run Phase

In the Run phase, the player first gets their choice of three possible targets. These targets might differ in difficulty, rewards, or the challenges offered.

Having chosen a target, the runner draws cards from their deck. The runner has an initial deck of basic cards. They start by drawing cards up to their hand limit, which starts at 3. Cards may offer the following advantages:

* Data; this is the fundamental currency of hacking. Most cards offer at least 1 data.
* Skills; skills allow the runner to bypass challenges for less Data than spending it directly. There are a total of 9 skills, in 3 categories: Social, Making, and Breaking. 
  * Specifically, the Social skills are Deception, Charm, and Connections; the Making skills are Architecture, Comprehension, and Style; the Breaking skills are Cryptography, Automation, and Malice.
* "Expertise", which is the fuel for Runner-specific or Upgrade-specific abilities
* A multiple of another Data card (so, for instance, an x3 card that can multiply any Data-providing card by 3)
* Allowing the Runner to draw more cards (possibly in addition to something else)
* Increases or decreases to Heat and Fatigue (more on those in a bit)

Cards may provide two options, so the interface should allow the runner to choose which one easily.

Each target offers a sequence of obstacles. Each obstacle is either a Data requirement; a Skill requirement; both; or a choice between two. (For instance, a high Data requirement vs. a low Data plus a skill) Skill requirements may be either a specific skill, or a broad category. As the game progresses, obstacles require more Data and more specific Skills.

Some Obstacles are not determined by the target ahead of time, but only when the runner encounters them. They are randomly determined based on the target's nature and how far into the game it is.

If the player can't, or doesn't want to, bypass an obstacle, they can, by taking a point of Fatigue, draw an additional card; then if they have more than the hand limit (starts at 3), they discard down. They can keep repeating this as long as they want.

If the runner doesn't like the random Obstacle chosen, they may look for a way around. This requires the runner to take Heat (another negative quality, representing the attention of the authorities) and re-randomizes the Obstacle.

When the runner plays cards for Data or Skills, they are discarded. Once the Obstacle is overcome, cards in hand are kept, but any leftover Data is wasted. The runner draws one additional card for free.

Some Upgrades or Runners may offer abilities that can be activated when playing cards. These might provide resources, allow the Runner to draw more cards, etc. These will usually be limited either to once per run or once per obstacle.

As the runner advances into the target, they gain additional rewards of Cash or Secrets for each Obstacle passed. After passing any Obstacle, they may decide to finish the run rather than advancing further. They must escape safely (passing one or more additional random Obstacle checks, depending on the target.) A complete run on a target should have about seven obstacles. In most cases runners should not complete most of their runs--they should have to escape before the end.

If the Runner's deck is exhausted mid-run, they gain a Fatigue and re-shuffle to make a new one.

#### Fatigue and Heat

If the runner's Fatigue fills up, they are too exhausted to continue the run. The run ends immediately and they only earn half of their accumulated Cash and Secrets.

If the runner's Heat fills up:
* If the runner has a Burner ID, which is a special resource, they lose their Burner ID. Their Heat immediately drops to 0, and they must end the run, but there is no other penalty. The runner starts the game with one Burner ID (they can be bought as upgrades, but are expensive)
* If the runner has no Burner ID, they are captured by the authorities and the game ends in defeat.

When the Runner's Heat is more than half full, they gain a special advantage: their hand limit increases by 1. The first time in a run this happens, they also draw a card. (This doesn't work if the runner drops beneath the threshold and then goes back above it.)

### Downtime Phase

Upon starting the Downtime phase, the Runner loses 1 Heat and 1 Fatigue for free. Then they may choose two (the same option can be chosen multiple times):

* Rest, losing 3 additional Fatigue and Heat
* Shop. The Runner is offered 3 options. These mostly require Cash and can provide:
  * New Cards, offering better Skills, better Skill options, more Data, Expertise plus something else, etc.
  * Upgrades. The runner can only hold 3 Upgrades, but they are powerful options they don't need to be drawn
  * The opportunity to remove cards from the Runner deck, thinning it. Starting cards can only be removed by an option which specifically allows it, which is more expensive than a general removal.

Once the player is done, they proceed to the Run phase again. The game should take about 12 Run phases. The last run is specially lucrative--longer, offering more rewards, and more demanding Obstacles especially later on.

Once the last run is complete, the player's Secrets count is compared against a difficulty-specific threshold to determine the outcome of the game (complete success, marginal success, failure).