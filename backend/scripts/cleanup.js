require('dotenv').config();
const mongoose = require('mongoose');

const cleanup = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const User = mongoose.model('User', new mongoose.Schema({ role: String }));
    const Election = mongoose.model('Election', new mongoose.Schema({
      title: String,
      createdBy: mongoose.Schema.Types.ObjectId
    }));
    const Candidate = mongoose.model('Candidate', new mongoose.Schema({
      election: mongoose.Schema.Types.ObjectId
    }));
    const Vote = mongoose.model('Vote', new mongoose.Schema({
      election: mongoose.Schema.Types.ObjectId
    }));

    const elections = await Election.find();
    console.log(`Found ${elections.length} total elections.\n`);

    let removed = 0;
    for (const election of elections) {
      const ownerExists = election.createdBy
        ? await User.exists({ _id: election.createdBy })
        : false;

      if (!ownerExists) {
        console.log(`Removing: "${election.title}" (no valid owner)`);
        await Vote.deleteMany({ election: election._id });
        await Candidate.deleteMany({ election: election._id });
        await Election.deleteOne({ _id: election._id });
        removed++;
      }
    }

    console.log(`\nDone! Removed ${removed} orphaned elections.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

cleanup();
