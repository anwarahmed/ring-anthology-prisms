# Campaign Outline

The complete plan for the Ring Anthology: Prisms campaign. **Each level entry is its
spec.** To build a level, read only its entry, [ENGINE.md](ENGINE.md), and the level
template. The code of other levels is never needed. Story facts come from
[LORE.md](LORE.md).

## Goal

By the end of the game, players should know the Halo timeline well: every major event
from the Precursors to the end of *Halo Infinite*, in order, and from each faction's
side.

## The canon rule

**Nothing new is added to the story.**

- **Every story beat is canon.** It comes from the games, novels, or official lore, and
  each level names its source.
- **Gameplay may stage a canon event,** deciding which room you fight in or which
  enemies appear. It never changes who did what, or how it ended.
- **Playable characters** are either canon characters who were there, or generic canon
  roles (a Marine, an ODST, a Spartan-IV, a Forerunner warrior-servant, a Sangheili
  warrior) when co-op needs a second player. Generic roles have no story of their own.
- **Bosses** are canon enemies only.
- **Where canon is thin** (a date or a detail), the entry says **(verify)**. The
  `lore-check` skill confirms it against [Halopedia](https://www.halopedia.org) before
  the level is built. If an event can't be confirmed, it stays out.

## The Refraction Framework

- **The central question:** *What are you willing to sacrifice to ensure your people's
  survival?* It's asked through canon events, never through new story.
- **Structure:** the game starts chronologically with the Forerunner era. After that,
  Parts are anchored to a canon place or artifact (Installation 04, the Ark, Requiem,
  Zeta Halo). Within a Part, levels jump between eras to show what happened in the same
  place across time.
- **Echo levels:** the same canon place in two eras. It reuses one level layout in two
  time states.
- **Every faction's side:** each faction is playable in at least one canon event.
- **The Archive** narrates. It isn't a character; it's a neutral timeline screen (see
  below).

## The Archive

There is no narrator character. Between levels, a timeline screen shows:

1. **The date and place** on a galaxy timeline, in the era's prism color.
2. **Archive cards:** short, neutral, kid-readable text about what happened, with
   illustrated panels. Each card names its source, such as *Halo 2* or *Primordium*.
3. **"Meanwhile..." cards** for canon events with no level of their own. These
   **archive scenes** are listed in the Parts below.

The timeline fills in as players progress. By the end, it shows the whole history.
Players can revisit any card from the main menu.

## Level spec format

```
### <id> · <Title>
- Era / when / where / source
- Players: P1 · P2
- Echo: <id>, if any
- Story: the canon events this level covers
- Sacrifice: how the canon events answer the central question
- Play: the gameplay hook and set pieces
- Enemies · Allies · Vehicles · Boss
- Status: planned | building | done
```

The level's folder is `levels/<id>/`. IDs never change once a level is built.

---

## Part I · The Mantle

**Archive scene: The Precursors.** The Forerunners rose against their creators, the
Precursors, and drove them to extinction. The last Precursors turned themselves into a
powder meant to bring them back one day. Over millions of years, the powder became
corrupted. The living things it touched were changed. This was the beginning of the
Flood. *(Source: Forerunner Saga; Halopedia: Precursors)*

### 1a · Lord of Admirals
- **Era:** Forerunner · **When/where:** c. 107,475–107,472 BCE, Charum Hakkor · **Source:** Forerunner Saga (*Primordium*); Halopedia: Battle of Charum Hakkor, Forthencho
- **Players:** P1 Forthencho, Lord of Admirals · P2 an ancient human soldier
- **Echo:** 1b
- **Story:** The Flood emerges in human space. Ancient humans and their San'Shyuum allies fight it, and it seems to vanish. Then comes the Plague War, fifty years against the Forerunners. At Charum Hakkor, the heart of the human empire, Forthencho holds out for three years. The San'Shyuum secretly make a deal that lets the Forerunners through. The survivors fall back to Citadel Charum, a Precursor ruin, for their final stand. Human leaders could release the Flood on the Forerunners to buy time. They refuse, because it is too dangerous for everyone, and they surrender.
- **Sacrifice:** Humanity gives up its empire rather than unleash the Flood.
- **Play:** A defense level in three stages: the outer defenses, the city, and Citadel Charum. Allied human soldiers hold each gate. The Forerunner fleet bombards the city in the sky behind.
- **Enemies:** Forerunner warrior-servants, Sentinels **(staging)**. **Allies:** human soldiers. **Vehicles:** none. **Boss:** none. The level ends in surrender, as in canon.
- **Status:** building

### 1b · The Fall of Charum Hakkor
- **Era:** Forerunner · **When/where:** the same battle · **Source:** Forerunner Saga; Halopedia: Battle of Charum Hakkor
- **Players:** P1 the Didact · P2 a Forerunner warrior-servant
- **Echo:** 1a (the same gates, from the attacking side)
- **Story:** The Didact leads the assault through seven slipspace portals, sacrificing ships in waves to break the human orbital defenses. After the surrender, the human survivors hide their rank insignia, but the Didact finds Forthencho among the captives and meets him as a fellow warrior. The Composers turn the captives into stored data. The Forerunners are searching their minds for the "cure" to the Flood they believe humanity found. Humanity is then devolved and sent to Earth **(verify)**.
- **Sacrifice:** The Forerunners sacrifice ships, and mercy, to end the war.
- **Play:** The players attack through the gates they defended in 1a. Introduces the hard-light dash.
- **Enemies:** ancient human soldiers. **Boss:** none.
- **Status:** planned

### 1c · First Contagion
- **Era:** Forerunner · **When/where:** the same age · **Source:** Halopedia: Forerunner–Flood war
- **Players:** P1 and P2 Forerunner warrior-servants
- **Story:** The Forerunners meet the Flood. Hundreds of their fleets are infested before the warrior-servants adopt total extermination. The Flood seems to retreat. It doesn't come back for more than nine thousand years.
- **Sacrifice:** The Forerunners destroy their own infested fleets.
- **Play:** Fight through an infested Forerunner fleet **(staging)**.
- **Enemies:** Flood. **Boss:** none.
- **Status:** planned

### 1d · The Master Builder
- **Era:** Forerunner · **When/where:** c. 98,445 BCE, the Greater Ark · **Source:** Forerunner Saga; Halopedia: Halo Array
- **Players:** P1 and P2 Forerunner warrior-servants
- **Echo:** 5a (the lesser Ark, where the final rings are built)
- **Story:** Master Builder Faber has the first twelve Halos built at the Greater Ark, each about 30,000 km across. The Didact's Prometheans oppose them and argue for Shield Worlds instead. They lose, and go into exile. The Librarian convinces the Council to make the rings preserves for life as well, as part of her Conservation Measure.
- **Sacrifice:** The Forerunners accept a weapon that can end all life.
- **Play:** Explore the Greater Ark while the rings are being built. A traversal level across giant ring scaffolds.
- **Enemies:** Sentinels **(staging)**. **Boss:** none.
- **Status:** planned

### 1e · Janjur Qom
- **Era:** Forerunner · **When/where:** the ancient past, Janjur Qom **(verify date)** · **Source:** Halopedia: Halo Array
- **Players:** P1 and P2 San'Shyuum (generic)
- **Echo:** 3a (Janjur Qom, when the Reformists leave)
- **Story:** The San'Shyuum rebel against the Forerunners. Faber uses a Halo to crush the rebellion.
- **Sacrifice:** The San'Shyuum lose their freedom.
- **Play:** Escape across the planet before the Halo's pulse.
- **Enemies:** Forerunner Sentinels. **Boss:** none (a race against the pulse).
- **Status:** planned

### 1f · The Cryptum
- **Era:** Forerunner · **When/where:** Earth (Erde-Tyrene) **(verify date)** · **Source:** *Halo: Cryptum*
- **Players:** P1 Bornstellar · P2 Chakas
- **Echo:** 6b (the Didact's Cryptum on Requiem)
- **Story:** Bornstellar, a young Forerunner, finds the Didact asleep in a Cryptum on Earth, where he went in his exile, and wakes him. Chakas and Riser, two ancient humans, travel with them.
- **Play:** Exploration and platforming to reach the Cryptum.
- **Enemies:** Sentinels **(verify)**. **Boss:** none.
- **Status:** planned

## Part II · Installation 04

**Archive scene: 343 Guilty Spark.** Chakas's essence became the Monitor of Installation
04, 343 Guilty Spark. *(Source: Forerunner Saga)*

### 2a · The Pillar of Autumn
- **Era:** Covenant War · **When/where:** 2552, the *Pillar of Autumn* · **Source:** *Halo: Combat Evolved*
- **Players:** P1 Master Chief · P2 a Marine
- **Echo:** 3m (the same ship, leaving Reach)
- **Story:** The *Pillar of Autumn* escapes the fall of Reach and finds Installation 04. The Covenant boards it. Master Chief wakes, and Cortana goes into his armor.
- **Play:** Escape to the lifeboats. Tutorial for the Covenant War kit.
- **Enemies:** Grunts, Jackals, Elites. **Boss:** none.
- **Status:** planned

### 2b · Halo
- **Era:** Covenant War · **When/where:** Installation 04 · **Source:** *Halo: Combat Evolved*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** The Chief rescues the Marines scattered across the ring.
- **Enemies:** Covenant. **Vehicles:** Warthog. **Boss:** none.
- **Status:** planned

### 2c · The Silent Cartographer
- **Era:** Covenant War · **When/where:** Installation 04 · **Source:** *Halo: Combat Evolved*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** A beach assault to find the map to the control room.
- **Enemies:** Covenant. **Vehicles:** Warthog. **Boss:** Hunters.
- **Status:** planned

### 2d · 343 Guilty Spark
- **Era:** Covenant War · **When/where:** Installation 04 · **Source:** *Halo: Combat Evolved*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** The Flood is discovered, and 343 Guilty Spark appears. Later, Cortana learns the ring's real purpose and the Chief refuses to fire it.
- **Enemies:** Flood. **Boss:** none.
- **Status:** planned

### 2e · The Hunt
- **Era:** Covenant War · **When/where:** Installation 04 · **Source:** *Halo: The Flood* (novel)
- **Players:** P1 Zuka 'Zamamee (Sangheili) · P2 Yayap (Unggoy)
- **Story:** The Covenant's side of Installation 04. 'Zamamee and Yayap hunt the "Demon" across the ring while the Flood overruns it.
- **Sacrifice:** 'Zamamee gives everything to restore his honor.
- **Play:** Plasma weapons and Elite melee. Plays as the Covenant against both the UNSC and the Flood.
- **Enemies:** Marines, Flood. **Vehicles:** Ghost. **Boss:** none **(verify the novel's events)**.
- **Status:** planned

### 2f · The Maw
- **Era:** Covenant War · **When/where:** the *Pillar of Autumn* · **Source:** *Halo: Combat Evolved*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** The Chief sets off the ship's reactor to destroy Halo, and escapes in the Warthog run.
- **Enemies:** Flood, Sentinels, Covenant. **Vehicles:** Warthog. **Boss:** the countdown.
- **Status:** planned

**Archive scene: Thel 'Vadamee's disgrace.** The Supreme Commander who failed to protect
Installation 04 is branded a heretic. *(Source: Halo 2)*

## Part III · The Covenant

### 3a · The Reformists
- **Era:** Covenant War (era color) · **When/where:** before 938 BCE, Janjur Qom **(verify date)** · **Source:** Halopedia: San'Shyuum
- **Players:** P1 and P2 Reformist San'Shyuum (generic)
- **Echo:** 1e
- **Story:** The San'Shyuum split between the Reformists, who want to use the Forerunner Dreadnought to find the Great Journey, and the Stoics, who forbid it. The Reformists leave Janjur Qom aboard the Dreadnought.
- **Enemies:** Stoics **(verify the conflict)**. **Boss:** none.
- **Status:** planned

### 3b · Ulgethon
- **Era:** Covenant War · **When/where:** 938 BCE, Sanghelios · **Source:** Halopedia: Arbiter, Covenant
- **Players:** P1 and P2 Sangheili warriors serving Arbiter Vema 'Togad
- **Echo:** 6e (Sanghelios, 2558)
- **Story:** The San'Shyuum arrive at Sanghelios. Arbiter Vema 'Togad, a ruler and judge of the clans, starts the War of Beginnings by killing a San'Shyuum delegation. The war lasts 86 years.
- **Enemies:** San'Shyuum forces, the Dreadnought's defenses **(verify)**. **Boss:** none.
- **Status:** planned

### 3c · Writ of Union
- **Era:** Covenant War · **When/where:** 852 BCE **(verify location)** · **Source:** Halopedia: Covenant
- **Players:** P1 and P2 Sangheili warriors
- **Story:** The Sangheili surrender. Pelahsar the Strident and Breaking Shadow agree to a truce, and the Writ of Union founds the Covenant. The Hierarchs make the Arbiter a position of power in the military.
- **Sacrifice:** The Sangheili give up their independence for the shared faith.
- **Play:** The final battle of the war ends in the truce.
- **Enemies:** San'Shyuum forces. **Boss:** none.
- **Status:** planned

**Archive scenes:** The Rending, a rebellion led by Ussa 'Xellus (851 BCE).
High Charity is built (851–791 BCE).

### 3d · Rentus
- **Era:** Covenant War · **When/where:** 784 BCE, Rentus · **Source:** Halopedia: Arbiter, Covenant
- **Players:** P1 Arbiter Jeht 'Lcmutee · P2 a Sangheili warrior
- **Story:** The Covenant fights the Lekgolo. Arbiter Jeht 'Lcmutee studies them and proposes bringing them into the Covenant. The Hierarchs reluctantly agree.
- **Enemies:** Lekgolo. **Boss:** a Hunter pair.
- **Status:** planned

**Archive scenes:**
- The Yanme'e join by treaty (1112).
- The Kig-Yar join as mercenaries after a war (1342).
- The Unggoy are inducted as laborers (2142).
- Arbiter Fal 'Chavamee rejects the Covenant's faith (c. 2152). The Prophets turn the title of Arbiter into a mark of shame, given to the disgraced for suicide missions.

### 3e · Balaho
- **Era:** Covenant War · **When/where:** 2462, Balaho · **Source:** Halopedia: Unggoy Rebellion
- **Players:** P1 and P2 Unggoy (generic)
- **Story:** The Unggoy Rebellion. The Unggoy rise up after Kig-Yar shipmasters harm their people. It ends when Arbiter Heki 'Gibadee forces Balaho's surrender (told gently).
- **Sacrifice:** The Unggoy risk everything for their families.
- **Play:** Plays from the Unggoy's side. Methane tanks, plasma grenades, and lots of them.
- **Enemies:** Kig-Yar, Sangheili. **Boss:** none.
- **Status:** planned

### 3f · Doisac
- **Era:** Covenant War · **When/where:** 2492, Doisac · **Source:** Halopedia: Jiralhanae
- **Players:** P1 and P2 Jiralhanae (generic)
- **Story:** The Covenant finds the Jiralhanae in the middle of a civil war. Some packs join willingly. The rest are defeated and absorbed.
- **Enemies:** rival Jiralhanae packs. **Boss:** none.
- **Status:** planned

### 3g · The Spartans
- **Era:** Covenant War · **When/where:** 2517–2525, Reach · **Source:** *Halo: The Fall of Reach*
- **Players:** P1 John-117 · P2 a Spartan-II trainee
- **Story:** Dr. Halsey's SPARTAN-II program. John and the other children train under Chief Petty Officer Mendez.
- **Play:** A training course that teaches the controls.
- **Enemies:** training drills. **Boss:** none.
- **Status:** planned

### 3h · Contact Harvest
- **Era:** Covenant War · **When/where:** 2525, Harvest · **Source:** *Halo: Contact Harvest*
- **Players:** P1 Sgt. Avery Johnson · P2 a Harvest militia soldier
- **Story:** First contact between humans and the Covenant. The Covenant's Luminaries identify humans as the Forerunners' "Reclaimers". The Prophets hide this and declare war on humanity.
- **Sacrifice:** The Prophets sacrifice the truth to keep their power.
- **Enemies:** Jiralhanae, Unggoy, Kig-Yar. **Boss:** Maccabeus? **(verify)**
- **Status:** planned

### 3i · Harvest
- **Era:** Covenant War · **When/where:** 2531, Harvest · **Source:** *Halo Wars*
- **Players:** P1 Sgt. John Forge · P2 a Marine
- **Story:** The *Spirit of Fire* fights the Covenant on Harvest.
- **Enemies:** Covenant. **Vehicles:** Warthog, Scorpion. **Boss:** none.
- **Status:** planned

### 3j · The Shield World
- **Era:** Covenant War · **When/where:** 2531, Trove's shield world · **Source:** *Halo Wars*
- **Players:** P1 Sgt. Forge · P2 a Spartan of Red Team
- **Echo:** 5g
- **Story:** Arbiter Ripa 'Moramee leads the Covenant forces and is killed by Forge. Forge stays behind and overloads the *Spirit of Fire*'s slipspace drive, destroying the shield world and the Covenant fleet (told gently).
- **Sacrifice:** Forge gives his life for the crew.
- **Enemies:** Covenant, Flood. **Boss:** Ripa 'Moramee.
- **Status:** planned

### 3k · Rise of Atriox
- **Era:** Banished (era color) · **When/where:** before 2552 **(verify date)** · **Source:** *Halo Wars 2* backstory ("Rise of Atriox")
- **Players:** P1 Atriox · P2 a Jiralhanae warrior
- **Echo:** 5h
- **Story:** The Covenant sends Brutes on suicide missions. Atriox survives every one. When his Sangheili commanders try to execute him, he rebels and founds the Banished.
- **Sacrifice:** The Banished give up the Covenant's protection to be free.
- **Enemies:** Sangheili. **Vehicles:** Chopper. **Boss:** **(verify which Sangheili commander)**.
- **Status:** planned

### 3l · Winter Contingency
- **Era:** Covenant War · **When/where:** 2552, Reach · **Source:** *Halo: Reach*
- **Players:** P1 Noble Six · P2 a Noble Team Spartan
- **Story:** The Covenant arrives on Reach.
- **Enemies:** Covenant. **Vehicles:** Warthog. **Boss:** an Elite Zealot.
- **Status:** planned

### 3m · The Pillar of Autumn (Reach)
- **Era:** Covenant War · **When/where:** 2552, Reach · **Source:** *Halo: Reach*
- **Players:** P1 Noble Six · P2 Emile
- **Echo:** 2a
- **Story:** Noble Six delivers Cortana to the *Pillar of Autumn*. Six stays behind to cover its escape (told gently). The ship goes on to Installation 04, which is Part II.
- **Sacrifice:** Six gives up any chance of escape so the ship can get away.
- **Enemies:** Covenant. **Boss:** none (a last stand).
- **Status:** planned

## Part IV · The Great Schism

### 4a · Cairo Station
- **Era:** Covenant War · **When/where:** 2552, Earth orbit · **Source:** *Halo 2*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** The Covenant attacks Earth. The Chief stops a bomb.
- **Enemies:** Covenant. **Boss:** none.
- **Status:** planned

### 4b · The Arbiter
- **Era:** Covenant War · **When/where:** 2552, a gas mine on Threshold · **Source:** *Halo 2*
- **Players:** P1 the Arbiter (Thel 'Vadamee) · P2 a Spec Ops Sangheili
- **Story:** Thel is spared execution and made Arbiter, the title of shame. He is sent to stop heretics who doubt the Prophets.
- **Play:** Active camo.
- **Enemies:** heretic Elites, Sentinels. **Vehicles:** Banshee. **Boss:** the Heretic Leader, Sesa 'Refumee.
- **Status:** planned

### 4c · Metropolis
- **Era:** Covenant War · **When/where:** 2552, New Mombasa · **Source:** *Halo 2*
- **Players:** P1 Master Chief · P2 a Marine
- **Story:** A Scarab rampages through the city.
- **Enemies:** Covenant. **Vehicles:** Scorpion, Warthog. **Boss:** the Scarab.
- **Status:** planned

### 4d · The Rookie
- **Era:** Covenant War · **When/where:** 2552, New Mombasa · **Source:** *Halo 3: ODST*
- **Players:** P1 the Rookie · P2 an ODST
- **Story:** The Rookie searches for his squad. The Superintendent, the city's AI, guides him.
- **Play:** No shields, VISR night vision.
- **Enemies:** Brutes, Grunts. **Boss:** none **(verify)**.
- **Status:** planned

### 4e · Sacred Icon
- **Era:** Covenant War · **When/where:** 2552, Delta Halo · **Source:** *Halo 2*
- **Players:** P1 the Arbiter · P2 a Spec Ops Sangheili
- **Story:** The Arbiter fights through the Library for the Index.
- **Enemies:** Sentinels, Flood. **Boss:** none.
- **Status:** planned

### 4f · The Great Journey
- **Era:** Covenant War · **When/where:** 2552, Delta Halo · **Source:** *Halo 2*
- **Players:** P1 the Arbiter · P2 Sgt. Johnson
- **Story:** The Prophets replace the Elites with the Brutes, and the Great Schism begins. The Arbiter learns the truth about the Halos. Elites and humans fight together to stop Tartarus from firing the ring.
- **Sacrifice:** The Elites give up the faith they lived for.
- **Enemies:** Brutes. **Vehicles:** Banshee, Scarab. **Boss:** Tartarus.
- **Status:** planned

## Part V · The Ark

### 5a · The Firing
- **Era:** Forerunner · **When/where:** 97,445 BCE, the lesser Ark (Installation 00) · **Source:** Forerunner Saga; Halopedia: Forerunner–Flood war
- **Players:** P1 the IsoDidact (Bornstellar) · P2 a Forerunner warrior-servant
- **Echo:** 5c (the same Ark, 2552)
- **Story:** The Flood destroys the Greater Ark. The IsoDidact brings the surviving Forerunners to the lesser Ark. The Librarian draws the Flood to Earth and dies there. The Halo Array is fired. All sentient life in the galaxy is wiped out, and the Flood is starved. The surviving Forerunners leave the galaxy.
- **Sacrifice:** The Forerunners give up their own civilization.
- **Play:** Hold the Ark while the Array charges (staging). The firing is shown on the Archive's star map, never in gameplay.
- **Enemies:** Flood. **Boss:** none.
- **Status:** planned

### 5b · Sierra 117
- **Era:** Covenant War · **When/where:** 2552, Kenya · **Source:** *Halo 3*
- **Players:** P1 Master Chief · P2 the Arbiter
- **Story:** The Chief returns to Earth. Elites and humans are now allies.
- **Enemies:** Brutes. **Boss:** Brute Chieftain **(verify)**.
- **Status:** planned

### 5c · The Ark
- **Era:** Covenant War · **When/where:** 2552, the Ark · **Source:** *Halo 3*
- **Players:** P1 Master Chief · P2 the Arbiter
- **Echo:** 5a
- **Enemies:** Brutes. **Vehicles:** Warthog, Mongoose. **Boss:** a Scarab.
- **Status:** planned

### 5d · The Covenant
- **Era:** Covenant War · **When/where:** the Ark · **Source:** *Halo 3*
- **Players:** P1 Master Chief · P2 the Arbiter
- **Story:** Two Scarabs. The Arbiter ends the Prophet of Truth.
- **Enemies:** Brutes, Flood. **Vehicles:** Hornet. **Boss:** two Scarabs.
- **Status:** planned

### 5e · Cortana
- **Era:** Covenant War · **When/where:** High Charity · **Source:** *Halo 3*
- **Players:** P1 Master Chief · P2 the Arbiter
- **Story:** The Chief rescues Cortana from the Gravemind.
- **Enemies:** Flood. **Boss:** none.
- **Status:** planned

### 5f · Halo
- **Era:** Covenant War · **When/where:** the new Installation 04 at the Ark **(verify name)** · **Source:** *Halo 3*
- **Players:** P1 Master Chief · P2 the Arbiter
- **Story:** The Chief fires the unfinished ring to destroy the Flood. 343 Guilty Spark turns on them, and Johnson falls (told gently). The Warthog run follows.
- **Sacrifice:** Johnson.
- **Enemies:** Flood, Sentinels. **Vehicles:** Warthog. **Boss:** 343 Guilty Spark.
- **Status:** planned

**Archive scene:** The war ends (2553). The Chief and Cortana drift in the stern of the
*Forward Unto Dawn*.

### 5g · Spirit of Fire
- **Era:** Banished · **When/where:** 2559, the Ark · **Source:** *Halo Wars 2*
- **Players:** P1 and P2 Red Team Spartans
- **Echo:** 3j
- **Story:** The *Spirit of Fire* wakes after 28 years. It finds the Ark held by Atriox's Banished.
- **Enemies:** Banished. **Boss:** Decimus.
- **Status:** planned

### 5h · The Banished at the Ark
- **Era:** Banished · **When/where:** 2559, the Ark · **Source:** *Halo Wars 2*
- **Players:** P1 Atriox · P2 a Jiralhanae warrior
- **Echo:** 5g, 3k
- **Story:** The Banished's side of the Ark campaign **(verify the playable Banished events)**.
- **Enemies:** UNSC. **Vehicles:** Chopper. **Boss:** none.
- **Status:** planned

## Part VI · Requiem & the Created

### 6a · The Composer
- **Era:** Forerunner · **When/where:** during the Forerunner–Flood war · **Source:** Forerunner Saga
- **Players:** P1 the Ur-Didact · P2 a Promethean Knight
- **Echo:** 6b
- **Story:** The Didact fights the Flood. He uses the Composer on humans to make Promethean Knights ("turning people into hard-light data"). The Librarian stops him and imprisons him in a Cryptum on Requiem.
- **Sacrifice:** The Didact gives up his conscience to win.
- **Enemies:** Flood. **Boss:** none.
- **Status:** planned

### 6b · Requiem
- **Era:** Created · **When/where:** 2557, Requiem · **Source:** *Halo 4*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Echo:** 1f, 6a
- **Story:** The Chief wakes after four years adrift, and unknowingly frees the Didact.
- **Play:** Introduces the Created era kit.
- **Enemies:** Covenant remnant, Prometheans. **Boss:** none.
- **Status:** planned

### 6c · Composer
- **Era:** Created · **When/where:** 2557, Ivanoff Station · **Source:** *Halo 4*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Story:** The Didact uses the Composer on the station's people.
- **Enemies:** Prometheans. **Boss:** none.
- **Status:** planned

### 6d · Midnight
- **Era:** Created · **When/where:** 2557, the Didact's ship, the *Mantle's Approach* · **Source:** *Halo 4*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Story:** The Chief stops the Didact. Cortana sacrifices herself (told gently).
- **Sacrifice:** Cortana.
- **Vehicles:** Broadsword. **Boss:** the Didact.
- **Status:** planned

### 6e · Osiris
- **Era:** Created · **When/where:** 2558, Sanghelios · **Source:** *Halo 5: Guardians*
- **Players:** P1 Spartan Locke · P2 Spartan Buck
- **Echo:** 3b
- **Story:** Fireteam Osiris helps the Arbiter's Swords of Sanghelios against the Covenant remnant. The title of Arbiter, once a mark of shame, is now one of honor.
- **Enemies:** Covenant remnant, Prometheans. **Boss:** the Warden Eternal.
- **Status:** planned

### 6f · Blue Team
- **Era:** Created · **When/where:** 2558 **(verify location)** · **Source:** *Halo 5: Guardians*
- **Players:** P1 Master Chief · P2 Fred-104
- **Story:** Blue Team goes AWOL to follow Cortana's signal.
- **Enemies:** Prometheans. **Boss:** none.
- **Status:** planned

### 6g · Guardians
- **Era:** Created · **When/where:** 2558, Genesis · **Source:** *Halo 5: Guardians*
- **Players:** P1 Locke · P2 Vale
- **Story:** Cortana and the Created take control of the Guardians. She traps Blue Team in a Cryptum.
- **Sacrifice:** The Created give up the galaxy's freedom for peace.
- **Enemies:** Prometheans. **Boss:** the Warden Eternal.
- **Status:** planned

## Part VII · Zeta Halo

### 7a · Mendicant Bias
- **Era:** Forerunner · **When/where:** c. 97,495 BCE, Installation 07 · **Source:** Forerunner Saga; Halopedia: Forerunner–Flood war
- **Players:** P1 the IsoDidact · P2 a Forerunner warrior-servant
- **Echo:** 7c–7g (Zeta Halo, 2560)
- **Story:** The AI Mendicant Bias test-fires Installation 07 near Charum Hakkor and releases the Primordial, which is really a Gravemind. The Primordial turns Mendicant Bias against the Forerunners. The IsoDidact retakes the ring and captures Mendicant Bias.
- **Enemies:** Sentinels under Mendicant Bias **(verify)**. **Boss:** none.
- **Status:** planned

### 7b · The Primordial
- **Era:** Forerunner · **When/where:** Installation 07 **(verify)** · **Source:** *Halo: Primordium*
- **Players:** P1 Chakas · P2 Riser
- **Story:** Chakas and Riser on Installation 07. The Primordial's secret about the Flood's origins.
- **Enemies:** Sentinels **(verify)**. **Boss:** none.
- **Status:** planned

**Archive scenes:**
- The Forerunners imprison the Endless on Zeta Halo. *(Source: Halo Infinite)*
- The Banished attack the UNSC *Infinity*, Zeta Halo is damaged, and Cortana's fate comes to light through the Weapon (2559–2560).

### 7c · Warship Gbraakon
- **Era:** Banished · **When/where:** 2560, Zeta Halo · **Source:** *Halo Infinite*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Story:** The Pilot finds the Chief, who storms the Banished warship.
- **Enemies:** Banished. **Boss:** **(verify)**.
- **Status:** planned

### 7d · The Conservatory
- **Era:** Banished · **When/where:** 2560, Zeta Halo · **Source:** *Halo Infinite*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Enemies:** Banished. **Boss:** **(verify)**.
- **Status:** planned

### 7e · Spire
- **Era:** Banished · **When/where:** 2560, Zeta Halo · **Source:** *Halo Infinite*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Enemies:** Banished. **Boss:** **(verify)**.
- **Status:** planned

### 7f · House of Reckoning
- **Era:** Banished · **When/where:** 2560, Zeta Halo · **Source:** *Halo Infinite*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Story:** Escharum's last fight (told with dignity).
- **Sacrifice:** Escharum gives his life for the Banished's legend.
- **Enemies:** Banished. **Boss:** Escharum.
- **Status:** planned

### 7g · The Silent Auditorium
- **Era:** Banished · **When/where:** 2560, Zeta Halo · **Source:** *Halo Infinite*
- **Players:** P1 Master Chief · P2 a Spartan-IV
- **Story:** The Harbinger tries to free the Endless. The Chief stops her. This is where *Halo Infinite*'s story ends.
- **Enemies:** Banished, Skimmers. **Boss:** the Harbinger.
- **Status:** planned

**Closing archive:** the full timeline, complete.

---

## Firefight

Firefight waves are played on maps reused from campaign levels. A map unlocks when its
level is completed.

- **Roster:** for each era, the enemies and the player characters from that era's levels.
- **Wave structure:** 5 waves per round, 3 rounds per set. A boss appears in wave 5 of round 3.
- **Difficulty:** uses the four game difficulty levels. Each wave adds tougher enemies.
