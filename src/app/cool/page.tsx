export default function Kewl() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-primary text-white gap-5">
      {/* 
      Write something unique about you here! 
      It could be a club you're part of, a weird skill you have, or something special that happened to you.
      Feel free to put links, images, whatever! 
      Don't worry about styling- we aren't grading you on this- it's just to get to know you better! :) 
      */}
      <h1>hey I'm Daniel Yang!</h1>
      <div className="flex flex-col justify-center items-center"><p>I'm a second year at Georgia Tech studying Computer Science</p></div>
      <div className="flex flex-col justify-center items-center">
        <p>I'm from San Jose, CA</p>
        <p>Interested in AI, machine learning, and software engineering</p>
        <p>Currently working on (and learning about) cloud computing tools and infrastructure, and database management</p>
      </div>
      <h2>Fun Facts about me:</h2>
      <div className="flex flex-col justify-center items-center">
        <p>Eagle Scout</p>
        <p>Enjoys playing ping pong, pickleball, basketball</p>
        <p>Has a Molly Tea addiction</p>
        <p>Favorite show is Better Call Saul</p>
        <p>Can type somewhat fast</p>
      </div>
    </div>
  );
}
