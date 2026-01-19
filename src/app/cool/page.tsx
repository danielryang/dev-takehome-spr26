/**
 * Personal "cool" page displaying bio and portfolio
 * Features minimalistic design with neutral color palette
 * Includes personal information, interests, and image gallery
 */
export default function Kewl() {
  // Portfolio image paths
  const images = [
    "/images/cool/0A35438A-2A53-49A6-9AE5-B87FA4D60E5A.jpeg",
    "/images/cool/101A8215-0A1C-4412-A810-F8810F6962D9_1_105_c.jpeg",
    "/images/cool/383CEB3D-4021-4ED5-8F23-533294563DA2_1_102_o.jpeg",
    "/images/cool/3E696A07-7C66-49E8-A337-C4E62B4156C4_1_102_o.jpeg",
    "/images/cool/4F6260DC-882F-42D9-B5C8-D0567F8E5056_1_105_c.jpeg",
    "/images/cool/97CADF2C-921B-461D-B5BF-0CD331D0DB30_1_102_o.jpeg",
    "/images/cool/B5870C3F-10B1-4225-AD55-947E67B1FF71_1_105_c.jpeg",
    "/images/cool/D4580D99-7470-4099-A470-8BFB33873C00_1_102_o.jpeg",
    "/images/cool/E3BC26E2-C75E-4521-8EB0-8036621FDF8B_1_102_o.jpeg",
    "/images/cool/F3683312-8F3C-4713-B7DD-7901B80447EC_1_105_c.jpeg",
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-light text-neutral-900 mb-6">Daniel Yang</h1>

        <div className="space-y-4 text-neutral-700 text-lg leading-relaxed">
          <p>Second year at Georgia Tech studying Computer Science.</p>
          <p>From San Jose, CA.</p>
          <p>Interested in AI, machine learning, and software engineering.</p>
          <p>Transferred from University of Wisconsin-Madison where I studied Computer Science and Computer Engineering.</p>
        </div>

        <div className="mt-16 space-y-3 text-neutral-600">
          <p>Eagle Scout</p>
          <p>Ping pong, pickleball, basketball</p>
          <p>Molly Tea enthusiast</p>
          <p>Pho lover</p>
          <p>Better Call Saul fan</p>
          <p>
            Can{" "}
            <a
              href="https://monkeytype.com/profile/potatoskewers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 underline hover:text-neutral-600 transition"
            >
              type
            </a>{" "}
            somewhat fast
          </p>
        </div>

        <div className="mt-12">
          <video
            src="/images/cool/videos/My Movie 1.mp4"
            controls
            className="w-full rounded-sm"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, index) => (
            <div key={index} className="aspect-square overflow-hidden bg-neutral-200">
              <img
                src={src}
                alt={`${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
