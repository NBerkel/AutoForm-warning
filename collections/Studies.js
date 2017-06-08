import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

Schema = {};

// Required AutoForm setup
SimpleSchema.extendOptions(['autoform']);

Studies = new Mongo.Collection('studies');

Studies.allow({
  insert: function (userId, doc) {
    return !!userId;
  },
  update: function (userId, doc, fields, modifier) {
    // Check that author_id matches user_id
    // if (userId == doc.user_id && !doc.exported) {
    if (userId == doc.user_id) {
      return true;
    } else {
      return false;
    }
  }
});

Schema.Options = new SimpleSchema({
  option: { type: String, optional: true }
});

Schema.Questions = new SimpleSchema({
  title: { type: String, max: 50 },
  instructions: String,
  type: {
    type: Number,
    label: "Question type",
    autoform: {
      type: "select",
      options: function () {
        return [
          { label: "Free Text", value: 1 },
          { label: "Single Choice (Radio)", value: 2 },
          { label: "Multiple Choice (Checkbox)", value: 3 },
          { label: "Likert Scale", value: 4 },
          { label: "Quick Answer", value: 5 },
          { label: "Scale", value: 6 },
          { label: "Numeric", value: 7 }
        ];
      }
    }
  }
}, { tracker: Tracker });

Schema.Study = new SimpleSchema({
  user_id: {
    type: String,
    label: "User_id",
    autoValue: function () {
      return this.userId
    },
    autoform: {
      type: "hidden"
    }
  },

  title: {
    type: String,
    label: "Study title"
  },

  description: {
    type: String,
    label: "Description"
  },

  createdAt: {
    type: Date,
    label: "Created at",
    autoValue: function () {
      return new Date()
    },
    autoform: {
      type: "hidden"
    }
  },

  researcher_contact: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Researcher e-mail",
    autoValue: function () {
      //return Meteor.user().services.google.email
      // TODO
      return "test@example.com"
    },
    autoform: {
      type: "hidden"
    }
  },

  questions: {
    type: Array,
    optional: true
  },

  "questions.$": {
    type: Schema.Questions,
    minCount: 1,
    optional: true
  }
}, { tracker: Tracker });

// Schema.Study.extend(Schema.Questions);
Studies.attachSchema(Schema.Study);

Meteor.methods({
  deleteStudies: function (id) {
    // Check that user is logged
    if (this.userId) {
      // Check id format
      check(id, String);

      // Find study to be removed
      study = Studies.findOne({ _id: id });

      // Check that author matches with login
      if (study.user_id == this.userId) {
        Studies.remove(id);
      }
      else {
        throw new Meteor.Error('not-authorized');
      }
    }
    else {
      throw new Meteor.Error('not-authorized');
    }
  }
});